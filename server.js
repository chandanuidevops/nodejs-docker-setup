const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
});
const dotenv = require(`dotenv`);
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;
const app = require('./app');
const socket = require("socket.io");

mongoose
  .connect('mongodb+srv://chandan:NNFS0jWIz4lhkakG@cluster0.o4ffhpq.mongodb.net/natours', {
    // .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
  })
  .then(() => {
    //console.log(conn.connections)
    console.log('Connection successfull');
  });

const port = process.env.PORT;

const server = app.listen(port, () => {
  console.log('App running on port ' + port);
});
const io = socket(server, {
  cors: {
    origin: "http://localhost:3000",
    credentials: true,
  },
});
global.onlineUsers = new Map();

io.on('connection',(socket)=>{
  global.chatSocket=socket
  socket.on('add-user',(userid)=>{
    onlineUsers.set(userid,socket.id)
   
  })
  socket.on('send-msg',(data)=>{
   
    const sendUserSocket = onlineUsers.get(data.to);
    
    if (sendUserSocket) {
     
      socket.to(sendUserSocket).emit("msg-receive", data.msg);
    }
   
  })
})
process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

