const { request, response } = require('express');
const PDFGenerator = require('../utils/pdfGenerator');
const ExcelGenerator = require('../utils/excelGenerator');
const TorneoModel = require('../models/torneo.model');
const EquipoModel = require('../models/equipo.model');
const PartidoModel = require('../models/partido.model');
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

class ReportesController {

    static async equiposPorTorneoPDF(req = request, res = response) {
        try {
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

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
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }
            
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

    static async jugadoresPorEquipoPDF(req = request, res = response) {
        try {
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }
            
            const { equipoId } = req.params;

            // Validar equipo
            const equipo = await EquipoModel.findById(equipoId);
            if (!equipo) {
                return res.status(404).json({
                    success: false,
                    message: 'Equipo no encontrado'
                });
            }

            // Obtener jugadores
            const jugadores = await EquipoModel.getJugadores(equipoId);

            // Generar PDF
            const pdfBuffer = await PDFGenerator.generarReporteJugadoresPorEquipo(equipo, jugadores);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="jugadores_${equipo.nombre.replace(/\s+/g, '_')}.pdf"`);
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

    static async jugadoresPorEquipoExcel(req = request, res = response) {
        try {
            
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { equipoId } = req.params;

            const equipo = await EquipoModel.findById(equipoId);
            if (!equipo) {
                return res.status(404).json({
                    success: false,
                    message: 'Equipo no encontrado'
                });
            }

            const jugadores = await EquipoModel.getJugadores(equipoId);

            // Generar Excel
            const excelBuffer = await ExcelGenerator.generarReporteJugadoresPorEquipo(equipo, jugadores);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="jugadores_${equipo.nombre.replace(/\s+/g, '_')}.xlsx"`);
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

    static async fixturePDF(req = request, res = response) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { torneoId } = req.params;

            const torneo = await TorneoModel.findById(torneoId);
            if (!torneo) {
                return res.status(404).json({
                    success: false,
                    message: 'Torneo no encontrado'
                });
            }

            // Obtener partidos del torneo
            const partidos = await PartidoModel.findByTorneo(torneoId);

            // Generar PDF
            const pdfBuffer = await PDFGenerator.generarReporteFixture(torneo, partidos);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="fixture_${torneo.nombre.replace(/\s+/g, '_')}.pdf"`);
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

    static async fixtureExcel(req = request, res = response) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { torneoId } = req.params;

            const torneo = await TorneoModel.findById(torneoId);
            if (!torneo) {
                return res.status(404).json({
                    success: false,
                    message: 'Torneo no encontrado'
                });
            }

            const partidos = await PartidoModel.findByTorneo(torneoId);

            // Generar Excel
            const excelBuffer = await ExcelGenerator.generarReporteFixture(torneo, partidos);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="fixture_${torneo.nombre.replace(/\s+/g, '_')}.xlsx"`);
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

    static async calcularTablaPosiciones(torneoId) {
        console.log(torneoId);
        try {
            const query = `
                WITH estadisticas_equipos AS (
                    SELECT 
                        e.id as equipo_id,
                        e.nombre as equipo_nombre,
                        
                        -- Partidos jugados
                        COUNT(CASE WHEN p.estado = 'finalizado' THEN 1 END) as partidos_jugados,
                        
                        -- Partidos ganados
                        COUNT(CASE 
                            WHEN p.estado = 'finalizado' AND 
                                 ((p.equipo_local_id = e.id AND p.marcador_local > p.marcador_visitante) OR
                                  (p.equipo_visitante_id = e.id AND p.marcador_visitante > p.marcador_local))
                            THEN 1 
                        END) as partidos_ganados,
                        
                        -- Partidos empatados
                        COUNT(CASE 
                            WHEN p.estado = 'finalizado' AND p.marcador_local = p.marcador_visitante
                            THEN 1 
                        END) as partidos_empatados,
                        
                        -- Partidos perdidos
                        COUNT(CASE 
                            WHEN p.estado = 'finalizado' AND 
                                 ((p.equipo_local_id = e.id AND p.marcador_local < p.marcador_visitante) OR
                                  (p.equipo_visitante_id = e.id AND p.marcador_visitante < p.marcador_local))
                            THEN 1 
                        END) as partidos_perdidos,
                        
                        -- Goles a favor
                        SUM(CASE 
                            WHEN p.estado = 'finalizado' AND p.equipo_local_id = e.id THEN p.marcador_local
                            WHEN p.estado = 'finalizado' AND p.equipo_visitante_id = e.id THEN p.marcador_visitante
                            ELSE 0
                        END) as goles_favor,
                        
                        -- Goles en contra
                        SUM(CASE 
                            WHEN p.estado = 'finalizado' AND p.equipo_local_id = e.id THEN p.marcador_visitante
                            WHEN p.estado = 'finalizado' AND p.equipo_visitante_id = e.id THEN p.marcador_local
                            ELSE 0
                        END) as goles_contra
                        
                    FROM equipos e
                    LEFT JOIN partidos p ON (
                        (p.equipo_local_id = e.id OR p.equipo_visitante_id = e.id) 
                        AND p.torneo_id = $1
                    )
                    WHERE e.torneo_id = $1
                    GROUP BY e.id, e.nombre
                )
                SELECT 
                    equipo_id,
                    equipo_nombre,
                    partidos_jugados,
                    partidos_ganados,
                    partidos_empatados,
                    partidos_perdidos,
                    goles_favor,
                    goles_contra,
                    (goles_favor - goles_contra) as diferencia_goles,
                    ((partidos_ganados * 3) + partidos_empatados) as puntos
                FROM estadisticas_equipos
                ORDER BY 
                    puntos DESC,
                    diferencia_goles DESC,
                    goles_favor DESC,
                    equipo_nombre ASC
            `;

            const result = await pool.query(query, [torneoId]);
            return result.rows;

        } catch (error) {
            throw new Error(`Error al calcular tabla de posiciones: ${error.message}`);
        }
    }

    static async obtenerTablaPosiciones(req = request, res = response) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { torneoId } = req.params;

            const torneo = await TorneoModel.findById(torneoId);
            if (!torneo) {
                return res.status(404).json({
                    success: false,
                    message: 'Torneo no encontrado'
                });
            }   

            const tablaPosiciones = await ReportesController.calcularTablaPosiciones(torneoId);

            return res.status(200).json({
                success: true,
                message: 'Tabla de posiciones obtenida exitosamente',
                data: tablaPosiciones,
                torneo: {
                    id: torneo.id,
                    nombre: torneo.nombre,
                    disciplina: torneo.disciplina
                }
            });

        } catch (error) {
            console.error('Error al obtener tabla de posiciones:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener tabla de posiciones',
                error: error.message
            });
        }
    }

    static async tablaPosicionesPDF(req = request, res = response) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { torneoId } = req.params;

            const torneo = await TorneoModel.findById(torneoId);
            if (!torneo) {
                return res.status(404).json({
                    success: false,
                    message: 'Torneo no encontrado'
                });
            }

            // Calcular tabla de posiciones
            const tablaPosiciones = await ReportesController.calcularTablaPosiciones(torneoId);

            // Generar PDF
            const pdfBuffer = await PDFGenerator.generarReporteTablaPosiciones(torneo, tablaPosiciones);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `attachment; filename="tabla_posiciones_${torneo.nombre.replace(/\s+/g, '_')}.pdf"`);
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

    static async tablaPosicionesExcel(req = request, res = response) {
        try {

            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { torneoId } = req.params;

            const torneo = await TorneoModel.findById(torneoId);
            if (!torneo) {
                return res.status(404).json({
                    success: false,
                    message: 'Torneo no encontrado'
                });
            }

            const tablaPosiciones = await ReportesController.calcularTablaPosiciones(torneoId);

            // Generar Excel
            const excelBuffer = await ExcelGenerator.generarReporteTablaPosiciones(torneo, tablaPosiciones);

            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            res.setHeader('Content-Disposition', `attachment; filename="tabla_posiciones_${torneo.nombre.replace(/\s+/g, '_')}.xlsx"`);
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