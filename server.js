const mongoose = require('mongoose');
process.on('uncaughtException', (err) => {
  console.log(err.name, err.message);
});
const dotenv = require(`dotenv`);
dotenv.config({ path: './config.env' });
const DB = process.env.DATABASE;
const app = require('./app');


mongoose
  // .connect(DB, {
    .connect(process.env.MONGODB_URI, {
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

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

