const { request, response } = require('express');
const PDFGenerator = require('../utils/pdfGenerator');
const ExcelGenerator = require('../utils/excelGenerator');
const TorneoModel = require('../models/torneo.model');
const EquipoModel = require('../models/equipo.model');
const PartidoModel = require('../models/partido.model');
const { pool } = require('../config/db');

class ReportesController {

    static async equiposPorTorneoPDF(req = request, res = response) {
        try {
            const { torneoId } = req.params;

            // Validar torneo
            const torneo = await TorneoModel.findById(torneoId);
            if (!torneo) {
                return res.status(404).json({
                    success: false,
                    message: 'Torneo no encontrado'
                });
            }

            // Obtener equipos del torneo
            const equipos = await TorneoModel.getEquipos(torneoId);

            // Generar PDF
            const pdfBuffer = await PDFGenerator.generarReporteEquiposPorTorneo(torneo, equipos);

            // Enviar PDF como respuesta
            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="equipos_${torneo.nombre.replace(/\s+/g, '_')}.pdf"`);
            res.send(pdfBuffer);

        } catch (error) {
            console.error('Error al generar reporte PDF:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al generar reporte PDF',
                error: error.message
            });
        }
    }

    static async equiposPorTorneoExcel(req = request, res = response) {
        try {
            const { torneoId } = req.params;

            const torneo = await TorneoModel.findById(torneoId);
            if (!torneo) {
                return res.status(404).json({
                    success: false,
                    message: 'Torneo no encontrado'
                });
            }

            const equipos = await TorneoModel.getEquipos(torneoId);

            // Generar Excel
            const excelBuffer = await ExcelGenerator.generarReporteEquiposPorTorneo(torneo, equipos);

            // Enviar Excel como respuesta
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="equipos_${torneo.nombre.replace(/\s+/g, '_')}.xlsx"`);
            res.send(excelBuffer);

        } catch (error) {
            console.error('Error al generar reporte Excel:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al generar reporte Excel',
                error: error.message
            });
        }
    }

}

module.exports = ReportesController;