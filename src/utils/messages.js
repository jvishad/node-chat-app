const generateMessage = (username, text) => {
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}

const generateLocationMessage = (username, urllink) => {
    return {
        username,
        urllink,
        createdAt: new Date().getTime()
    }
}


module.exports = {
    generateMessage,generateLocationMessage
}