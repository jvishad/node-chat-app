const path = require('path')
const http = require('http')

const express = require('express')
const socketio = require('socket.io')
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)
const { generateMessage }= require('./utils/messages')
const { generateLocationMessage }= require('./utils/messages')
const { addUsers,removeUser,getUsers,getUsersInRoom }= require('./utils/users')

const PORT = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')


// configuration
app.use(express.static(publicDirectoryPath));

// server (emit) -> client (recieve) - countUpdated
// client (emit) -> server (recieve) - increment

// socket.emit sends event to the sender client only
// socket.broadcast.emit sends event to all the client except the sender itself 
// io.emit sends event to all the clients.

io.on('connection',(socket) => {
  console.log("New Websocket connected");

  socket.on('sendMessage', (message, callback) => {
    const iuser = getUsers(socket.id)

    const filter = new Filter(); 

    if(filter.isProfane(message)){
      return callback('Profanity is not allowed!!!')
    } 

    io.to(iuser.room).emit('message',generateMessage(iuser.username,message))
    callback()
  })
  
  // Not needed
  // socket.emit('message',generateMessage('Welcome!!!'))
  // socket.broadcast.emit('message',generateMessage('A new user has joined!!!'))

  socket.on('join', ({ username ,room }, callback ) => {
    const {error, user } = addUsers({ id: socket.id, username,room })

    if(error) {
        return callback(error)
    }

    socket.join(user.room)
    socket.emit('message',generateMessage('Admin','Welcome!!!'))
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))  

    io.to(user.room).emit('roomData', {
      room: user.room,
      users: getUsersInRoom(user.room)
    }) 
    callback()
    // io.to.emit (helps to send the message to everybody in a particular room which is connected).

    // socket.broadcast.to.emit (helps to send the message to a particular room except itself).
  })
  
  socket.on('disconnect', () => {
    const user = removeUser(socket.id)

    if(user){
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left!!!`))
      io.to(user.room).emit('roomData', {
        room: user.room,
        users: getUsersInRoom(user.room)
      }) 
    }
   })

  socket.on('sendLocation',(coords,callback) => {
    const useri = getUsers(socket.id)

    io.to(useri.room).emit('locationMessage',generateLocationMessage(useri.username ,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
    
    callback()
  })
});

server.listen(PORT, () => console.log(`Server running on port ${PORT}`))



