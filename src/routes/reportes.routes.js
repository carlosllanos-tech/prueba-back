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

// PDF
router.get(
    '/jugadores/equipo/:equipoId/pdf',
    [
        param('equipoId')
            .isInt({ min: 1 }).withMessage('El ID del equipo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.jugadoresPorEquipoPDF
);

// Excel
router.get(
    '/jugadores/equipo/:equipoId/excel',
    [
        param('equipoId')
            .isInt({ min: 1 }).withMessage('El ID del equipo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.jugadoresPorEquipoExcel
);

// PDF
router.get(
    '/fixture/torneo/:torneoId/pdf',
    [
        param('torneoId')
            .isInt({ min: 1 }).withMessage('El ID del torneo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.fixturePDF
);

// Excel
router.get(
    '/fixture/torneo/:torneoId/excel',
    [
        param('torneoId')
            .isInt({ min: 1 }).withMessage('El ID del torneo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.fixtureExcel
);

// JSON (endpoint para consumir en frontend)
router.get(
    '/tabla-posiciones/torneo/:torneoId',
    [
        param('torneoId')
            .isInt({ min: 1 }).withMessage('El ID del torneo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.obtenerTablaPosiciones
);

// PDF
router.get(
    '/tabla-posiciones/torneo/:torneoId/pdf',
    [
        param('torneoId')
            .isInt({ min: 1 }).withMessage('El ID del torneo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.tablaPosicionesPDF
);

// Excel
router.get(
    '/tabla-posiciones/torneo/:torneoId/excel',
    [
        param('torneoId')
            .isInt({ min: 1 }).withMessage('El ID del torneo debe ser un número positivo')
            .toInt()
    ],
    ReportesController.tablaPosicionesExcel
);

module.exports = router;