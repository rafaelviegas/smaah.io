'use strict'

const ValidationContract = require('../validations/fluent-validations');
const repository = require('../repositories/user-repository');
const identityService = require('../services/identity-service');
const md5 = require('md5');

exports.login = async (req, res, next) => {
    try {
               
        const user = await repository.findAsync(req.body.email, md5(req.body.password + global.SALT_KEY));

        if(!user){
            res.status(404).send([{
                message: 'Usuário ou senha inválidos. '
            }]);

            return;
        }

        const token = await identityService.generateToken({
                id: user._id,
                name: user.name,
                email: user.email, 
                roles: [user.roles] 
            });

        res.status(201).send({
            name: user.name,
            email: user.email,
            roles: [user.roles],
            token: token
        });

    } catch (error) {
        res.status(400).send([{message: 'Falha ao tentar realizar login do usuário.', data: error}]);
    }

};

exports.refreshToken = async (req, res, next) => {
    try {
        const token = req.body.token || req.query.token || req.headers['x-access-token'];
        const data = await identityService.decodeToken(token);

        const user = await repository.findByIdAsync(data.id);

        if(!user){
            res.status(401).send({
                message: 'Usuário não encontrado. '
            });

            return;
        }

        const tokenData = await identityService.generateToken({
                id: user._id,
                name: user.name,
                email: user.email, 
                roles: [user.roles] 
            });

        res.status(201).send({
            name: user.name,
            email: user.email,
            roles: [user.roles],
            token: tokenData
        });

    } catch (error) {
        res.status(400).send([{message: 'Falha ao tentar realizar login do usuário.', data: error}]);
    }

};

exports.findById = async (req, res, next)=>{

    try {

       var data =  await repository.findByIdAsync(req.params.id);
        res.status(200).send(data);

    } catch (error) {
        res.status(400).send([{message: 'Falha consultar usuário.', data: error}]);
    }

};

exports.post = async (req, res, next) => {
    try {
        
        let contract = new ValidationContract();

        //Validações de nome
        contract.isRequired(req.body.name, 'O nome é obrigatório. ');
        contract.hasMinLen(req.body.name, 3, 'O nome deve conter pelo menos 3 caracteres. ');
        contract.hasMaxLen(req.body.name, 255, 'O nome deve conter no máximo 255 caracteres. ');

        //Validações de e-mail
        contract.isEmail(req.body.email, 'E-mail inválido. ');
        contract.isRequired(req.body.email, 'O e-mail é obrigatório. ');
        contract.hasMinLen(req.body.email, 3, 'O e-mail deve conter pelo menos 3 caracteres. ');
        contract.hasMaxLen(req.body.email, 128, 'O e-mail deve conter no máximo 128 caracteres. ');
        const user = await repository.findByEmailAsync(req.body.email);
        if(user){
            res.status(400).send([{
                message: 'O usuário já possui cadastro na plataforma. '
            }]);

            return;
        }        

        //Validações de senha
        contract.isRequired(req.body.password, 'A senha é obrigatória. ');
        contract.hasMinLen(req.body.password, 6, 'A senha deve conter pelo menos 6 caracteres. ');
        contract.isNotEquals(req.body.password, req.body.confirmPassword, 'A confirmação de senha não confere. ');
    
        //Se os dados forem inválidos
        if(!contract.isValid()){
            res.status(400).send(contract.errors()).end();
            return;
        }

        await repository.createAsync({
            name: req.body.name,
            email: req.body.email,
            password: md5(req.body.password + global.SALT_KEY)
        });

        res.status(201).send({message: 'Membro registrado com sucesso! '});

    } catch (error) {
        res.status(400).send([{message: 'Falha ao registrar membro.', data: error}]);
    }

};

exports.put = async (req, res, next) => {
    try {
        
            let contract = new ValidationContract();

            //Validações de nome
            contract.isRequired(req.body.name, 'O nome é obrigatório. ');
            contract.hasMinLen(req.body.name, 3, 'O nome deve conter pelo menos 3 caracteres. ');
            contract.hasMaxLen(req.body.name, 255, 'O nome deve conter no máximo 255 caracteres. ');

            //Validações de e-mail
            contract.isEmail(req.body.email, 'E-mail inválido. ');
            contract.isRequired(req.body.email, 'O e-mail é obrigatório. ');
            contract.hasMinLen(req.body.email, 3, 'O e-mail deve conter pelo menos 3 caracteres. ');
            contract.hasMaxLen(req.body.email, 128, 'O e-mail deve conter no máximo 128 caracteres. ');

            //Validações de senha
            contract.isRequired(req.body.password, 'A senha é obrigatória. ');
            contract.hasMinLen(req.body.password, 6, 'A senha deve conter pelo menos 6 caracteres. ');
            contract.isNotEquals(req.body.password, req.body.confirmPassword, 'A confirmação de senha não confere. ');
        
            //Se os dados forem inválidos
            if(!contract.isValid()){
                res.status(400).send(contract.errors()).end();
                return;
            }

            await repository.updateAsync(req.params.id, {
                name: req.body.name,
                email: req.body.email,
                password: md5(req.body.password + global.SALT_KEY)
            });
            
            res.status(200).send({message: 'Dados do membro atualizados com sucesso!'});

    } catch (error) {
        res.status(400).send([{message: 'Falha ao atualizar dados do membro.', data: error}]);
    }
};
