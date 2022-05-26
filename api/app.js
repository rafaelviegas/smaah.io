'use strict'

const express = require('express');
const bodyParser = require('body-parser');
const measurement = require('./models/measurement');
const client = require('./models/client');
const user = require('./models/user');
const mongoose = require('mongoose');
const config = require('./config');
const worker = require('./worker');


const app = express()
  .use(express.json())
  .use(bodyParser.urlencoded({ extended: false }))
  .use(bodyParser.json({limit: '5mb'}));


  //Habilita o CORS
  app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-access-token');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS' )
    next();
  });

//conecta no banco
mongoose.connect(config.connectionString);

//conecta na fila
worker.connect(config.consumerQueue)

//carrega rotas
const userRoute = require('./routes/user-route');
const clientRoute = require('./routes/client-route');

app.use('/status', async (req, res, next) => {
  res.status(200).send({status: "healthy"});
});

app.use('/users', userRoute);
app.use('/clients', clientRoute);

module.exports = app;

