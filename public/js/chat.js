const socket = io()

// elements
const $messageForm = document.querySelector('#sbmt')
const $messageFormInput = document.querySelector('input')
const $messageFormButton = document.querySelector('button')

// selector for the send-location id
const $sendLocation = document.querySelector('#send-location')

const $messages = document.querySelector('#messages')

// Templates
const messagesTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// options
const { username, room } =  Qs.parse(location.search, {ignoreQueryPrefix: true})


const autoscroll = () => {
    // New message element
    const $newMessage = $messages.lastElementChild

    // Height of the new message
    const newMessageStyles = getComputedStyle($newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin

    // Visible height
    const visibleHeight = $messages.offsetHeight

    // Height of messages container
    const containerHeight = $messages.scrollHeight

    // How far have I scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

// socket.on is used for listening event.
socket.on('message', (message) => {
    console.log(message); 
    const html = Mustache.render(messagesTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('h:mm:ss A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('locationMessage',(url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username,
        url: url.urllink,
        createdAt: moment(url.createdAt).format('h:mm:ss A')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()
})

socket.on('roomData', ({ room,users }) => {
    // console.log(room)
    // console.log(users)
   const html = Mustache.render(sidebarTemplate, {
        room,
        users
   })
   document.querySelector('#sidebar').innerHTML = html

})


$messageForm.addEventListener('submit', (e) => {
    e.preventDefault()
// disable  
    $messageFormButton.setAttribute('disabled','disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage',message, (error) => {
// enable
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value = ''
    $messageFormInput.focus()

        if(error){
            return console.log(error)
        }
        console.log('Message delivered!!!')
    })
})


$sendLocation.addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('location not found!')
    }

    $sendLocation.setAttribute('disabled','disabled')
    
    navigator.geolocation.getCurrentPosition((position) => {
        $sendLocation.removeAttribute('disabled')
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            console.log('Location shared')
        })
    })
})


socket.emit('join', { username, room } ,(error) => {
    if(error) {
        alert(error)
        location.href = '/'
    }
})