'use strict'

const mongoose = require('mongoose');
const Measurement = mongoose.model('Measurement');

exports.create = (data) =>{

    var measurement = new Measurement(data);

    return measurement.save();    
};