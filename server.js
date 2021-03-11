const path = require('path');
const http = require('http'); //to use socket.io
const express = require('express');
const socketio = require('socket.io');
const formatMessage = require("./utils/messages");
const {userJoin, getCurrentUser,  userLeave, getRoomUsers} = require("./utils/users");

const app = express();
const server = http.createServer(app);
const io = socketio(server)

//Accessing frontend by making them static
//set static folder
app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Admin';
//Run when client connects
//It will handle connection,disconnection
io.on('connection', socket => {
  //whenever client connects it should jump into this
  // console.log('New Web Socket connection....');
  socket.on('joinRoom', ({username, room}) => {
    //create user
    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    //welcome current user
    socket.emit('message', formatMessage(botName, 'Welcome to chat room'));

    //broadcast when user connects
    socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`));
    //send users in room info
    io.to(user.room).emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
    })
  });

  //listen for chatMessage from main.js
  socket.on('chatMessage', msg => {
    const user = getCurrentUser(socket.id);
    // console.log(msg);// shows on server ie. terminal
    //telling only in a particular room that user has left the room
    io.to(user.room).emit('message', formatMessage(user.username, msg)); //call message in main.js
  });

  //when client disconnections
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    // console.log(socket.id);
    // console.log("joined user",user.room);
    if(user){
      // console.log("joined user",user.username);
      io.to(user.room).emit('message', formatMessage(botName, `${user.username} has left the chat`));

    io.to(user.room).emit('roomUsers',{
      room: user.room,
      users: getRoomUsers(user.room)
    });
  }
  });
});
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
