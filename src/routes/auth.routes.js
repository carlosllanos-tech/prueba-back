const express = require('express');
const { body } = require('express-validator');
const AuthController = require('../controllers/auth.controller');

const router = express.Router();

router.post(
    '/login', 
    [
        body('email')
            .notEmpty().withMessage('El email es requerido')
            .isEmail().withMessage('Debe ser un email válido')
            .normalizeEmail(),
        body('password')
            .notEmpty().withMessage('La contraseña es requerida')
            .isLength({min: 6}).withMessage('La contraseña debe tener al menos 6 caracteres')
    ],
    AuthController.login);

module.exports = router;