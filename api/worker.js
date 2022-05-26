'use strict'

var amqp = require('amqplib/callback_api');
const config = require('./config');
const measurementRepository = require('./repositories/measurement-repository');
const clientRepository = require('./repositories/client-repository');


exports.connect = async(queue) => {
    amqp.connect(config.amqpConnection, function (err, conn) {
        conn.createChannel(function (err, ch) {

            ch.assertExchange(config.exchange, 'topic', { durable: true });
            ch.assertQueue(queue);
            ch.prefetch(1);
            
            console.log(" [*] Waiting for messages in %s. To exit press CTRL+C", queue);
    
            ch.consume(queue, function (msg) {
                var data = JSON.parse(msg.content.toString().replace(/'/g, '"'));
                
               measurementRepository.create(data).then((measurement) => {
    
                clientRepository.findByClientId(measurement.client_id).then((client) =>{
    
                  if(client){
                      client.temperature = Math.trunc(data.temperature);
                      client.humidity = Math.trunc(data.humidity);
                      client.soilMoisture = data.soilMoisture;
                      client.isWaterOn = data.isWaterOn;
                      client.updated_on  = data.created_on;
                      clientRepository.update(client._id, client).then(() =>{

                        let moisture = client.soilMoisture/4095;
                        if(moisture < 1){

                           let moisturePercent = parseInt((1-moisture)*100);
                            
                           if((moisturePercent <= client.minimumSoilMoisture)  && !client.isWaterOn){

                              let command = "turnOnWater";
                              ch.publish(config.exchange, 'commands', new Buffer.from(command));

                           }

                           if((moisturePercent > client.minimumSoilMoisture)  && client.isWaterOn){

                            let command = "turnOffWater";
                            ch.publish(config.exchange, 'commands', new Buffer.from(command));

                           }
                        }
                    });
    
                  }else{
                    clientRepository.create(data);
                  
                  }
                })
    
               });
        
            }, { noAck: true });
        });
    });
};
