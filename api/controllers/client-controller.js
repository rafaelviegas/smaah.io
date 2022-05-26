'use strict'
const clientRepository = require('../repositories/client-repository');

exports.findByUserIdAsync = async (req, res, next)=>{

    try {

       var data =  await clientRepository.findByUserIdAsync(req.params.id);

        res.status(200).send(data);

    } catch (error) {
        res.status(400).send([{message: 'Falha ao consultar as informações do client.', data: error}]);
    }

};

exports.updateMinimumSoilMoistureAsync = async (req, res, next) => {
    try {
        
            await clientRepository.updateMinimumSoilMoisture(req.params.id, req.body.minimumSoilMoisture);
            
            res.status(200).send({message: 'Dados do cliente atualizados com sucesso!'});

    } catch (error) {
        res.status(400).send([{message: 'Falha ao atualizar dados do cliente.', data: error}]);
    }
};
