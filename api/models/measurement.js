'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema({
    client_id: String,
    temperature: Number,  
    humidity: Number,
    soilMoisture: Number,    
    created_on: Date,
    client: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Client'
    }
  });

module.exports = mongoose.model("Measurement", schema);
