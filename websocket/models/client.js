const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const schema = new Schema(
  {
    client_id: String,
    temperature: Number,  
    humidity: Number,
    soilMoisture: Number,    
    created_on: Date,
    updated_on: Date,
    measurements: [{
      type: Schema.Types.ObjectId,
      ref: "Measurement"
  }],
  }
);

module.exports = mongoose.model("Client", schema);;
