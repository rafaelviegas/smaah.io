'use strict'

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const schema = new Schema(
  {
    client_id: String,
    user_id:{
      type: Schema.Types.ObjectId,
      ref: "User"
    },
    temperature: Number,  
    humidity: Number,
    soilMoisture: Number, 
    isWaterOn:{
      type: Boolean,
      default: false
    },
    minimumSoilMoisture:{
      type: Number,
      default: 0
    },   
    created_on: Date,
    updated_on: Date,
    measurements: [{
      type: Schema.Types.ObjectId,
      ref: "Measurement"
  }],
  }
);

module.exports = mongoose.model("Client", schema);;
