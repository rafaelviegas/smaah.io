'use strict'
const http = require("http");
const debug = require('debug')('api:server');
const serverSocketIO = require("socket.io");
const mongoose = require("mongoose");

//
// default env vars
//
const {
  MONGODB_URL = process.env.DB_CONNECTION,
  SERVER_PORT = normalizePort(process.env.PORT || '3003')
} = process.env;

//
// mongoose models
//
const Client = require("./models/client");
//
// http server and socket.io socket
//
const server = http.createServer()
    .listen(SERVER_PORT)
    .on('error', onError)
    .on('listening', onListening);

const serverIO = serverSocketIO(server, { cors: { origin: '*' }}); 

//
// starting server and db conn
//
mongoose.connect(
  MONGODB_URL,
  { useNewUrlParser: true },
  err => {
    if (err) {
      console.log(`[SERVER_ERROR] MongoDB Connection:`, err);
      process.exit(1);
    }

    Client.watch().on("change", change => {
      console.log(`[SERVER_CHANGE_STREAM]:`, change);
      serverIO.emit("changeData", change);
    });

    serverIO.on("connection", function(data) {
      console.log("[SERVER_SOCKET_IO] New Connection:", data.client.id);
    });
  }
);

function normalizePort(val){

    const port = parseInt(val, 10);

    if(isNaN(port)){
        return val;
    }
    if(port>=0){
        return port;
    }
    return false;
}

function onListening(){
    const addr = server.address();
    const bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
    
    debug('Listening on ' + bind);
}

function onError(error){
    if(error.syscall !== 'listen'){
        throw error;
    }
    
    const bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

    switch(error.code){

        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;

        case 'EADDRINUSE':
            console.error(bind + ' is already in use :(');
            process.exit(1);
            break;

        default:
            throw error;            
    }

}
