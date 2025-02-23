
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();

app.use(cors({
    origin: '*', // Разрешаем запросы от этого origin
    methods: ['GET', 'POST'], // Разрешаем только GET и POST запросы
    credentials: true // Разрешаем передачу кук и заголовков авторизации
}));

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Разрешаем подключения от этого origin
        methods: ['GET', 'POST'] // Разрешаем только GET и POST запросы
    }
});

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('createRoom', (roomId) => {
        socket.join(roomId);
        socket.emit('roomCreated', roomId);
    });

    socket.on('joinRoom', (roomId) => {
        socket.join(roomId);
        socket.to(roomId).emit('userJoined', socket.id);
    });

    socket.on('signal', (data) => {
        socket.to(data.roomId).emit('signal', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port 3000');
});
