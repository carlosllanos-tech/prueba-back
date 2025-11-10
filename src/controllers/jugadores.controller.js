const { validationResult } = require('express-validator');
const JugadorModel = require('../models/jugador.model');
const EquipoModel = require('../models/equipo.model');

class JugadoresController { 

    static async listar(req, res) {
        try {
            const jugadores = await JugadorModel.findAll();

            return res.status(200).json({
                success: true,
                message: 'Jugadores obtenidos exitosamente',
                data: jugadores,
                total: jugadores.length
            });

        } catch (error) {
            console.error('Error al listar jugadores:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener jugadores',
                error: error.message
            });
        }
    }

    static async crear(req, res) {
        try {
            // Validar errores de express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { nombre, apellido, fecha_nacimiento, nro_camiseta, posicion, equipo_id } = req.body;

            // Verificar que el equipo existe
            const equipo = await EquipoModel.findById(equipo_id);
            if (!equipo) {
                return res.status(404).json({
                    success: false,
                    message: 'El equipo especificado no existe'
                });
            }

            // Verificar que no exista un jugador con el mismo número en el equipo
            const numeroExiste = await JugadorModel.numeroCamisetaExisteEnEquipo(nro_camiseta, equipo_id);
            if (numeroExiste) {
                return res.status(409).json({
                    success: false,
                    message: `Ya existe un jugador con el número ${nro_camiseta} en este equipo`
                });
            }

            // Validar edad si se proporciona fecha de nacimiento
            if (fecha_nacimiento) {
                const edad = JugadorModel.calcularEdad(fecha_nacimiento);
                if (edad < 10 || edad > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'La edad del jugador debe estar entre 10 y 100 años'
                    });
                }
            }

            // Crear el jugador
            const nuevoJugador = await JugadorModel.create({
                nombre,
                apellido,
                fecha_nacimiento,
                nro_camiseta,
                posicion,
                equipo_id
            });

            return res.status(201).json({
                success: true,
                message: 'Jugador creado exitosamente',
                data: nuevoJugador
            });

        } catch (error) {
            console.error('Error al crear jugador:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al crear jugador',
                error: error.message
            });
        }
    }

    static async obtenerPorId(req, res) {
        try {
            const { id } = req.params;

            // Validar que el ID sea un número
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            const jugador = await JugadorModel.findById(id);

            if (!jugador) {
                return res.status(404).json({
                    success: false,
                    message: 'Jugador no encontrado'
                });
            }

            // Calcular edad si hay fecha de nacimiento
            if (jugador.fecha_nacimiento) {
                jugador.edad = JugadorModel.calcularEdad(jugador.fecha_nacimiento);
            }

            return res.status(200).json({
                success: true,
                message: 'Jugador encontrado',
                data: jugador
            });

        } catch (error) {
            console.error('Error al obtener jugador:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al obtener jugador',
                error: error.message
            });
        }
    }

    static async actualizar(req, res) {
        try {
            // Validar errores de express-validator
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Errores de validación',
                    errors: errors.array()
                });
            }

            const { id } = req.params;

            // Validar que el ID sea un número
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar que el jugador exista
            const jugadorExiste = await JugadorModel.findById(id);
            if (!jugadorExiste) {
                return res.status(404).json({
                    success: false,
                    message: 'Jugador no encontrado'
                });
            }

            // Verificar permisos:
            // - Si es admin, puede editar cualquier jugador
            // - Si es organizador, solo puede editar jugadores de sus torneos
            // - Si es delegado, puede editar jugadores
            const esAdmin = req.usuario.rol_nombre === 'admin';
            const esDelegado = req.usuario.rol_nombre === 'delegado';
            const esOrganizadorDelTorneo = jugadorExiste.torneo_organizador_id === req.usuario.id;

            if (!esAdmin && !esDelegado && !esOrganizadorDelTorneo) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para modificar este jugador'
                });
            }

            // Si se está cambiando el número de camiseta, verificar que no exista otro jugador
            if (req.body.nro_camiseta && req.body.nro_camiseta !== jugadorExiste.nro_camiseta) {
                const numeroExiste = await JugadorModel.numeroCamisetaExisteEnEquipo(
                    req.body.nro_camiseta,
                    jugadorExiste.equipo_id,
                    id
                );

                if (numeroExiste) {
                    return res.status(409).json({
                        success: false,
                        message: `Ya existe otro jugador con el número ${req.body.nro_camiseta} en este equipo`
                    });
                }
            }

            // Validar edad si se proporciona fecha de nacimiento
            if (req.body.fecha_nacimiento) {
                const edad = JugadorModel.calcularEdad(req.body.fecha_nacimiento);
                if (edad < 10 || edad > 100) {
                    return res.status(400).json({
                        success: false,
                        message: 'La edad del jugador debe estar entre 10 y 100 años'
                    });
                }
            }

            // Actualizar el jugador
            const jugadorActualizado = await JugadorModel.update(id, req.body);

            return res.status(200).json({
                success: true,
                message: 'Jugador actualizado exitosamente',
                data: jugadorActualizado
            });

        } catch (error) {
            console.error('Error al actualizar jugador:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al actualizar jugador',
                error: error.message
            });
        }
    }

    static async eliminar(req, res) {
        try {
            const { id } = req.params;

            // Validar que el ID sea un número
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar que el jugador exista
            const jugador = await JugadorModel.findById(id);
            if (!jugador) {
                return res.status(404).json({
                    success: false,
                    message: 'Jugador no encontrado'
                });
            }

            // Verificar permisos
            const esAdmin = req.usuario.rol_nombre === 'admin';
            const esDelegado = req.usuario.rol_nombre === 'delegado';
            const esOrganizadorDelTorneo = jugador.torneo_organizador_id === req.usuario.id;

            if (!esAdmin && !esDelegado && !esOrganizadorDelTorneo) {
                return res.status(403).json({
                    success: false,
                    message: 'No tienes permisos para eliminar este jugador'
                });
            }

            // Eliminar el jugador
            await JugadorModel.delete(id);

            return res.status(200).json({
                success: true,
                message: 'Jugador eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar jugador:', error);
            return res.status(500).json({
                success: false,
                message: 'Error al eliminar jugador',
                error: error.message
            });
        }
    }

}

module.exports = JugadoresController;