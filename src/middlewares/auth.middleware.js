const { request, response } = require('express');
const jwt = require('jsonwebtoken');

const verificarToken = async (req = request, res = response, next) => {
    try {
        const authHeader = req.header.authorization;
        if(!authHeader) {
            return res.status(401).json({
                success: false,
                message: 'No se proporciono token de autenticación'
            });
        }

        const token = authHeader.split(' '[1]);
        if(!token) {
            return res.status(401).json({
                success: false,
                message: 'Formato de token invalido'
            });
        }

    } catch (error) {
        
    }
}

module.exports = {
    verificarToken
}