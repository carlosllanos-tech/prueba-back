const express = require('express');
const { body, param } = require('express-validator');
const JugadoresController = require('../controllers/jugadores.controller');
const { verificarToken, esAdminOrganizadorODelegado } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/', JugadoresController.listar);

router.post(
    '/',
    [
        verificarToken,
        esAdminOrganizadorODelegado,

        // Validación de nombre
        body('nombre')
            .notEmpty().withMessage('El nombre del jugador es requerido')
            .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
            .trim(),

        // Validación de apellido
        body('apellido')
            .notEmpty().withMessage('El apellido del jugador es requerido')
            .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
            .trim(),

        // Validación de fecha de nacimiento (opcional)
        body('fecha_nacimiento')
            .optional()
            .isISO8601().withMessage('La fecha de nacimiento debe ser válida (YYYY-MM-DD)')
            .toDate()
            .custom((value) => {
                const hoy = new Date();
                const edad = (hoy - value) / (1000 * 60 * 60 * 24 * 365);

                if (edad < 10 || edad > 100) {
                    throw new Error('La edad del jugador debe estar entre 10 y 100 años');
                }

                return true;
            }),

        // Validación de número de camiseta
        body('nro_camiseta')
            .notEmpty().withMessage('El número de camiseta es requerido')
            .isInt({ min: 1, max: 99 }).withMessage('El número de camiseta debe estar entre 1 y 99')
            .toInt(),

        // Validación de posición (opcional)
        body('posicion')
            .optional()
            .isLength({ max: 50 }).withMessage('La posición no puede exceder 50 caracteres')
            .trim(),

        // Validación de equipo_id
        body('equipo_id')
            .notEmpty().withMessage('El ID del equipo es requerido')
            .isInt({ min: 1 }).withMessage('El ID del equipo debe ser un número positivo')
            .toInt()
    ],
    JugadoresController.crear
);

router.get('/:id', JugadoresController.obtenerPorId);

router.put(
    '/:id',
    [
        verificarToken,
        esAdminOrganizadorODelegado,

        // Validación de ID
        param('id')
            .isInt({ min: 1 }).withMessage('El ID debe ser un número entero positivo')
            .toInt(),

        // Validación de nombre (opcional)
        body('nombre')
            .optional()
            .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres')
            .trim(),

        // Validación de apellido (opcional)
        body('apellido')
            .optional()
            .isLength({ min: 2, max: 100 }).withMessage('El apellido debe tener entre 2 y 100 caracteres')
            .trim(),

        // Validación de fecha de nacimiento (opcional)
        body('fecha_nacimiento')
            .optional()
            .isISO8601().withMessage('La fecha de nacimiento debe ser válida (YYYY-MM-DD)')
            .toDate()
            .custom((value) => {
                const hoy = new Date();
                const edad = (hoy - value) / (1000 * 60 * 60 * 24 * 365);

                if (edad < 10 || edad > 100) {
                    throw new Error('La edad del jugador debe estar entre 10 y 100 años');
                }

                return true;
            }),

        // Validación de número de camiseta (opcional)
        body('nro_camiseta')
            .optional()
            .isInt({ min: 1, max: 99 }).withMessage('El número de camiseta debe estar entre 1 y 99')
            .toInt(),

        // Validación de posición (opcional)
        body('posicion')
            .optional()
            .isLength({ max: 50 }).withMessage('La posición no puede exceder 50 caracteres')
            .trim()
    ],
    JugadoresController.actualizar
);

router.delete(
    '/:id',
    [
        verificarToken,
        esAdminOrganizadorODelegado
    ],
    JugadoresController.eliminar
);

module.exports = router;