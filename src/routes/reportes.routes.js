const express = require('express');
const { param } = require('express-validator');
const { verificarToken } = require('../middlewares/auth.middleware');
const ReportesController = require('../controllers/reportes.controller');

const router = express.Router();

// Todas las rutas de reportes requieren autenticación
router.use(verificarToken);

// PDF
router.get(
    '/equipos/torneo/:torneoId/pdf',
    [
        param('torneoId')
            .isInt({ min: 1 }).withMessage('El ID del torneo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.equiposPorTorneoPDF
);

// Excel
router.get(
    '/equipos/torneo/:torneoId/excel',
    [
        param('torneoId')
            .isInt({ min: 1 }).withMessage('El ID del torneo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.equiposPorTorneoExcel
);

module.exports = router;