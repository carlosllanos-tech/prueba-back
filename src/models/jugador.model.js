const { pool } = require('../config/db');

class JugadorModel {

    static async findAll() {
        try {
            const query = `
                SELECT 
                j.id,
                j.nombre,
                j.apellido,
                j.fecha_nacimiento,
                j.nro_camiseta,
                j.posicion,
                j.equipo_id,
                e.nombre as equipo_nombre,
                e.color as equipo_color,
                t.id as torneo_id,
                t.nombre as torneo_nombre,
                t.disciplina as torneo_disciplina,
                j.creado_en,
                j.actualizado_en
                FROM jugadores j
                INNER JOIN equipos e ON j.equipo_id = e.id
                INNER JOIN torneos t ON e.torneo_id = t.id
                ORDER BY e.nombre, j.nro_camiseta
            `;

            const result = await pool.query(query);
            return result.rows;
        } catch (error) {
            throw new Error(`Error al obtener jugadores: ${error.message}`);
        }
    }

    static async numeroCamisetaExisteEnEquipo(nroCamiseta, equipoId, jugadorIdExcluir = null) {
        try {
            let query = `
                SELECT id FROM jugadores 
                WHERE nro_camiseta = $1 AND equipo_id = $2
            `;

            const values = [nroCamiseta, equipoId];

            // Si se proporciona un ID para excluir (actualización), agregarlo a la query
            if (jugadorIdExcluir) {
                query += ` AND id != $3`;
                values.push(jugadorIdExcluir);
            }

            const result = await pool.query(query, values);
            return result.rows.length > 0;
        } catch (error) {
            throw new Error(`Error al verificar número de camiseta: ${error.message}`);
        }
    }

    static calcularEdad(fechaNacimiento) {
        if (!fechaNacimiento) return null;

        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad;
    }

    static async create(jugadorData) {
        const {
            nombre,
            apellido,
            fecha_nacimiento,
            nro_camiseta,
            posicion,
            equipo_id
        } = jugadorData;

        try {
            const query = `
        INSERT INTO jugadores (
            nombre, 
            apellido, 
            fecha_nacimiento,
            nro_camiseta, 
            posicion,
            equipo_id
        )
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING 
            id, 
            nombre, 
            apellido, 
            fecha_nacimiento,
            nro_camiseta, 
            posicion,
            equipo_id,
            creado_en
        `;

            const values = [
                nombre,
                apellido,
                fecha_nacimiento || null,
                nro_camiseta,
                posicion || null,
                equipo_id
            ];

            const result = await pool.query(query, values);
            return result.rows[0];
        } catch (error) {
            // Error de violación de constraint UNIQUE (equipo_id, nro_camiseta)
            if (error.code === '23505') {
                throw new Error('Ya existe un jugador con ese número de camiseta en este equipo');
            }
            // Error de foreign key (equipo no existe)
            if (error.code === '23503') {
                throw new Error('El equipo especificado no existe');
            }
            // Error de CHECK constraint (nro_camiseta debe estar entre 1 y 99)
            if (error.code === '23514') {
                throw new Error('El número de camiseta debe estar entre 1 y 99');
            }
            throw new Error(`Error al crear jugador: ${error.message}`);
        }
    }

    static async findById(id) {
        try {
            const query = `
                SELECT 
                j.id,
                j.nombre,
                j.apellido,
                j.fecha_nacimiento,
                j.nro_camiseta,
                j.posicion,
                j.equipo_id,
                e.nombre as equipo_nombre,
                e.color as equipo_color,
                e.torneo_id,
                t.nombre as torneo_nombre,
                t.disciplina as torneo_disciplina,
                t.organizador_id as torneo_organizador_id,
                j.creado_en,
                j.actualizado_en
                FROM jugadores j
                INNER JOIN equipos e ON j.equipo_id = e.id
                INNER JOIN torneos t ON e.torneo_id = t.id
                WHERE j.id = $1
            `;

            const result = await pool.query(query, [id]);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            throw new Error(`Error al buscar jugador por ID: ${error.message}`);
        }
    }

    static async update(id, jugadorData) {
        const {
            nombre,
            apellido,
            fecha_nacimiento,
            nro_camiseta,
            posicion
        } = jugadorData;

        try {
            const query = `
                UPDATE jugadores 
                SET 
                nombre = COALESCE($1, nombre),
                apellido = COALESCE($2, apellido),
                fecha_nacimiento = COALESCE($3, fecha_nacimiento),
                nro_camiseta = COALESCE($4, nro_camiseta),
                posicion = COALESCE($5, posicion),
                actualizado_en = NOW()
                WHERE id = $6
                RETURNING 
                id, 
                nombre, 
                apellido, 
                fecha_nacimiento,
                nro_camiseta, 
                posicion,
                equipo_id,
                actualizado_en
            `;

            const values = [
                nombre,
                apellido,
                fecha_nacimiento,
                nro_camiseta,
                posicion,
                id
            ];

            const result = await pool.query(query, values);

            if (result.rows.length === 0) {
                return null;
            }

            return result.rows[0];
        } catch (error) {
            // Error de violación de constraint UNIQUE
            if (error.code === '23505') {
                throw new Error('Ya existe otro jugador con ese número de camiseta en este equipo');
            }
            // Error de CHECK constraint
            if (error.code === '23514') {
                throw new Error('El número de camiseta debe estar entre 1 y 99');
            }
            throw new Error(`Error al actualizar jugador: ${error.message}`);
        }
    }

    static async delete(id) {
        try {
            const query = `DELETE FROM jugadores WHERE id = $1`;
            const result = await pool.query(query, [id]);
            return result.rowCount > 0;
        } catch (error) {
            throw new Error(`Error al eliminar jugador: ${error.message}`);
        }
    }

}

module.exports = JugadorModel;