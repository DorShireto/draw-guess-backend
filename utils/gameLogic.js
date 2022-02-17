exports.Room = class {
    constructor(props) {
        this.ip = props.io;
        this.socket = props.socket;
        this.username = props.username;
        this.roomId = props.roomId;
        this.action = props.action;
    }

    listenToCoordinates = () => {
        this.socket.on('coordinates', (coordinatesData) => {
            this.socket.broadcast.to(this.roomId).emit('coordinates', { x: coordinatesData.x, y: coordinatesData.y });
        });
    }
}