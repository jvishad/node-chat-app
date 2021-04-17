const users =  []

// addUsers,romoveUsers,getUsers, getUsersInRoom 

const addUsers = ( { id, username, room }) => {
    //  clean the data
    // username = username.trim().toLowerCase()
    // room = room.trim().toLowerCase()

    // validate the data
    if(!username || !room){
        return {
            error: 'Username and room is required!'
        }
    }

    // check the existing 
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // validate the user
    if(existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // store the user 
    const user = { id,username,room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    // findIndex function will return -1 if not found else there is a match 
    const index = users.findIndex((user) => user.id === id)
    if(index != -1){
        return users.splice(index, 1)[0]
    }
}

// to get the details of the users
const getUsers = (id) => {
    return (users[users.findIndex(x => x.id === id)])
}

const getUsersInRoom = (room) => {
    // room = room.trim().toLowerCase
    return users.filter((user) => user.room === room)
}


// addUsers({
//     id:1,
//     username: "bj",
//     room:2322
// })

// addUsers({
//     id:1,
//     username: "b1j",
//     room:2322
// })

// addUsers({
//     id:1,
//     username: "b11j",
//     room:2322
// })

// const ans = getUsersInRoom(2322)
// console.log(ans)

module.exports = {
    addUsers,removeUser,getUsers,getUsersInRoom
}

