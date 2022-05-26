'use strict'

const mongoose = require('mongoose');
const Client = mongoose.model('Client');

exports.findByClientId = (client_id) =>{

    return Client.findOne({client_id}, 'client_id user_id temperature humidity soilMoisture minimumSoilMoisture isWaterOn updated_on')
        .populate('measurements');
};

exports.findByUserIdAsync = async (user_id) =>{

    return await Client.find({user_id}, 'client_id user_id temperature humidity soilMoisture minimumSoilMoisture isWaterOn updated_on');
};

exports.create = (data) =>{

    var client = new Client(data);
    return client.save();
};

exports.update = (id, data) =>{
    return Client
        .findByIdAndUpdate(id,{
            $set: {
                temperature :data.temperature,
                humidity: data.humidity,
                soilMoisture: data.soilMoisture,
                minimumSoilMoisture: data.minimumSoilMoisture,
                isWaterOn: data.isWaterOn,
                updated_on: data.updated_on,
            }
        });
};

exports.updateMinimumSoilMoisture = (id, minimumSoilMoisture) =>{
    return Client
        .findByIdAndUpdate(id,{
            $set: {
                minimumSoilMoisture: minimumSoilMoisture
            }
        });
};



