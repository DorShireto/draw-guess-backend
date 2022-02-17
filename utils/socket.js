const { Server, Socket } = require("socket.io");
const gameLogic = require("./gameLogic");

exports.init = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "*"
        }
    });
    io.on('connection', socket => {
        socket.emit('user-connection', 'User have join server')
        console.log("Socket connected with ", socket.id);
        let { username, roomId, action } = socket.handshake.query;
        console.log(username, roomId, action)
        const gameRoom = new gameLogic.Room({ io, socket, username, roomId, action })
        gameRoom.init(username)
        gameRoom.listenToCoordinates()
    })

}