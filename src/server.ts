import express from 'express';
import socketIo from 'socket.io';

const app = express();

app.use(express.static('public'));

const server = app.listen(3000, () => console.log('Listening at localhost:3000'));

const io = socketIo(server);

const usersConnected = {} as any;

io.on('connection', (socket) => {
    const user = {name: `Guest_${socket.id}`};

    socket.on('typing', (id) => {
        socket.broadcast.emit('someoneTyping', usersConnected[id].name);
    });

    socket.on('name', (name) => {
        usersConnected[socket.id] = user;

        if(name){
            user.name = name;
        }

        socket.broadcast.emit('someoneConnected', user.name);

        io.emit('connectedsUpdate', usersConnected);
    });

    socket.on('message', (message) => {
        if(message){
            socket.broadcast.emit('newMessage', {name: user.name, message});
        }
    });

    socket.on('disconnect', (reason) => {
        io.emit('someoneDisconnect', user.name);

        delete usersConnected[socket.id];

        io.emit('connectedsUpdate', usersConnected);
    });
});