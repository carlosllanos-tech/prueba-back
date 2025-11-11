const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFGenerator {

    static crearDocumento() {
        return new PDFDocument({
            size: 'A4',
            margins: {
                top: 50,
                bottom: 50,
                left: 50,
                right: 50
            }
        });
    }

    static agregarEncabezado(doc, titulo, subtitulo = null) {
        doc.fontSize(20)
            .font('Helvetica-Bold')
            .text(titulo, { align: 'center' })
            .moveDown(0.5);

        if (subtitulo) {
            doc.fontSize(12)
                .font('Helvetica')
                .text(subtitulo, { align: 'center' })
                .moveDown(0.5);
        }

        // Línea separadora
        doc.moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke()
            .moveDown();
    }

    static agregarPieDePagina(doc, texto = null) {
        const bottom = doc.page.height - 50;

        doc.fontSize(8)
            .font('Helvetica')
            .text(
                texto || `Generado el ${new Date().toLocaleString('es-BO')}`,
                50,
                bottom,
                { align: 'center' }
            );
    }

    static async generarReporteEquiposPorTorneo(torneo, equipos) {
        return new Promise((resolve, reject) => {
            try {
                const doc = this.crearDocumento();
                const chunks = [];

                // Capturar el contenido del PDF en memoria
                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Encabezado
                this.agregarEncabezado(
                    doc,
                    `Equipos del Torneo: ${torneo.nombre}`,
                    `${torneo.disciplina} - ${torneo.temporada || ''}`
                );

                // Información del torneo
                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .text('Información del Torneo:', { underline: true })
                    .moveDown(0.3);

                doc.font('Helvetica')
                    .text(`Estado: ${torneo.estado}`)
                    .text(`Fecha Inicio: ${new Date(torneo.fecha_inicio).toLocaleDateString('es-BO')}`)
                    .text(`Fecha Fin: ${new Date(torneo.fecha_fin).toLocaleDateString('es-BO')}`)
                    .text(`Total de Equipos: ${equipos.length}`)
                    .moveDown();

                // Tabla de equipos
                doc.fontSize(12)
                    .font('Helvetica-Bold')
                    .text('Lista de Equipos:', { underline: true })
                    .moveDown(0.5);

                // Encabezados de tabla
                const tableTop = doc.y;
                const col1 = 50;
                const col2 = 150;
                const col3 = 300;
                const col4 = 420;

                doc.fontSize(9)
                    .font('Helvetica-Bold')
                    .text('Nº', col1, tableTop)
                    .text('Nombre', col2, tableTop)
                    .text('Representante', col3, tableTop)
                    .text('Jugadores', col4, tableTop);

                // Línea debajo de encabezados
                doc.moveTo(50, doc.y + 5)
                    .lineTo(545, doc.y + 5)
                    .stroke()
                    .moveDown(0.5);

                // Datos de equipos
                doc.font('Helvetica');
                equipos.forEach((equipo, index) => {
                    const y = doc.y;

                    // Verificar si necesitamos una nueva página
                    if (y > 700) {
                        doc.addPage();
                        doc.y = 50;
                    }

                    doc.text(`${index + 1}`, col1, doc.y)
                        .text(equipo.nombre, col2, y, { width: 140 })
                        .text(equipo.representante || 'N/A', col3, y, { width: 110 })
                        .text(equipo.total_jugadores || '0', col4, y)
                        .moveDown(0.3);
                });

                // Pie de página
                this.agregarPieDePagina(doc);

                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    static async generarReporteJugadoresPorEquipo(equipo, jugadores) {
        return new Promise((resolve, reject) => {
            try {
                const doc = this.crearDocumento();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Encabezado
                this.agregarEncabezado(
                    doc,
                    `Plantel del Equipo: ${equipo.nombre}`,
                    `Torneo: ${equipo.torneo_nombre}`
                );

                // Información del equipo
                doc.fontSize(10)
                    .font('Helvetica-Bold')
                    .text('Información del Equipo:', { underline: true })
                    .moveDown(0.3);

                doc.font('Helvetica')
                    .text(`Representante: ${equipo.representante || 'N/A'}`)
                    .text(`Teléfono: ${equipo.telefono_representante || 'N/A'}`)
                    .text(`Total de Jugadores: ${jugadores.length}`)
                    .moveDown();

                // Tabla de jugadores
                doc.fontSize(12)
                    .font('Helvetica-Bold')
                    .text('Nómina de Jugadores:', { underline: true })
                    .moveDown(0.5);

                // Encabezados de tabla
                const tableTop = doc.y;
                const col1 = 50;
                const col2 = 90;
                const col3 = 250;
                const col4 = 400;
                const col5 = 480;

                doc.fontSize(9)
                    .font('Helvetica-Bold')
                    .text('Nro.', col1, tableTop)
                    .text('Nombre', col2, tableTop)
                    .text('Fecha Nac.', col3, tableTop)
                    .text('Posición', col4, tableTop)
                    .text('Edad', col5, tableTop);

                doc.moveTo(50, doc.y + 5)
                    .lineTo(545, doc.y + 5)
                    .stroke()
                    .moveDown(0.5);

                // Datos de jugadores
                doc.font('Helvetica');
                jugadores.forEach((jugador) => {
                    const y = doc.y;

                    if (y > 700) {
                        doc.addPage();
                        doc.y = 50;
                    }

                    const edad = jugador.fecha_nacimiento
                        ? this.calcularEdad(jugador.fecha_nacimiento)
                        : 'N/A';

                    doc.text(jugador.nro_camiseta, col1, doc.y)
                        .text(`${jugador.nombre} ${jugador.apellido}`, col2, y, { width: 150 })
                        .text(
                            jugador.fecha_nacimiento
                                ? new Date(jugador.fecha_nacimiento).toLocaleDateString('es-BO')
                                : 'N/A',
                            col3,
                            y
                        )
                        .text(jugador.posicion || 'N/A', col4, y, { width: 70 })
                        .text(edad, col5, y)
                        .moveDown(0.3);
                });

                this.agregarPieDePagina(doc);
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    static async generarReporteFixture(torneo, partidos) {
        return new Promise((resolve, reject) => {
            try {
                const doc = this.crearDocumento();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Encabezado
                this.agregarEncabezado(
                    doc,
                    `Fixture y Resultados: ${torneo.nombre}`,
                    `${torneo.disciplina} - ${torneo.temporada || ''}`
                );

                // Información
                doc.fontSize(10)
                    .font('Helvetica')
                    .text(`Total de Partidos: ${partidos.length}`)
                    .moveDown();

                // Agrupar partidos por fecha
                const partidosPorFecha = this.agruparPorFecha(partidos);

                Object.keys(partidosPorFecha).forEach(fecha => {
                    // Fecha como encabezado
                    doc.fontSize(11)
                        .font('Helvetica-Bold')
                        .text(new Date(fecha).toLocaleDateString('es-BO', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                        }), { underline: true })
                        .moveDown(0.3);

                    partidosPorFecha[fecha].forEach(partido => {
                        if (doc.y > 700) {
                            doc.addPage();
                            doc.y = 50;
                        }

                        doc.fontSize(9)
                            .font('Helvetica');

                        const hora = new Date(partido.fecha).toLocaleTimeString('es-BO', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });

                        const resultado = partido.estado === 'finalizado'
                            ? `${partido.marcador_local} - ${partido.marcador_visitante}`
                            : partido.estado.toUpperCase();

                        doc.text(`${hora} - ${partido.lugar || 'Por definir'}`)
                            .text(`    ${partido.equipo_local_nombre}  vs  ${partido.equipo_visitante_nombre}`)
                            .text(`    Resultado: ${resultado}`)
                            .moveDown(0.5);
                    });

                    doc.moveDown(0.5);
                });

                this.agregarPieDePagina(doc);
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    static async generarReporteTablaPosiciones(torneo, tablaPosiciones) {
        return new Promise((resolve, reject) => {
            try {
                const doc = this.crearDocumento();
                const chunks = [];

                doc.on('data', chunk => chunks.push(chunk));
                doc.on('end', () => resolve(Buffer.concat(chunks)));
                doc.on('error', reject);

                // Encabezado
                this.agregarEncabezado(
                    doc,
                    `Tabla de Posiciones: ${torneo.nombre}`,
                    `${torneo.disciplina} - Actualizado: ${new Date().toLocaleDateString('es-BO')}`
                );

                // Encabezados de tabla
                const tableTop = doc.y + 10;
                const col1 = 50;   // Pos
                const col2 = 80;   // Equipo
                const col3 = 250;  // PJ
                const col4 = 290;  // PG
                const col5 = 330;  // PE
                const col6 = 370;  // PP
                const col7 = 410;  // GF
                const col8 = 450;  // GC
                const col9 = 490;  // DG
                const col10 = 530; // Pts

                doc.fontSize(9)
                    .font('Helvetica-Bold')
                    .text('Pos', col1, tableTop)
                    .text('Equipo', col2, tableTop)
                    .text('PJ', col3, tableTop)
                    .text('PG', col4, tableTop)
                    .text('PE', col5, tableTop)
                    .text('PP', col6, tableTop)
                    .text('GF', col7, tableTop)
                    .text('GC', col8, tableTop)
                    .text('DG', col9, tableTop)
                    .text('Pts', col10, tableTop);

                doc.moveTo(50, doc.y + 5)
                    .lineTo(570, doc.y + 5)
                    .stroke()
                    .moveDown(0.5);

                // Datos de la tabla
                doc.font('Helvetica');
                tablaPosiciones.forEach((equipo, index) => {
                    const y = doc.y;

                    if (y > 720) {
                        doc.addPage();
                        doc.y = 50;
                    }

                    // Resaltar primeros 3 lugares
                    if (index < 3) {
                        doc.font('Helvetica-Bold');
                    } else {
                        doc.font('Helvetica');
                    }

                    doc.text(`${index + 1}`, col1, doc.y)
                        .text(equipo.equipo_nombre, col2, y, { width: 160 })
                        .text(equipo.partidos_jugados || '0', col3, y)
                        .text(equipo.partidos_ganados || '0', col4, y)
                        .text(equipo.partidos_empatados || '0', col5, y)
                        .text(equipo.partidos_perdidos || '0', col6, y)
                        .text(equipo.goles_favor || '0', col7, y)
                        .text(equipo.goles_contra || '0', col8, y)
                        .text(equipo.diferencia_goles || '0', col9, y)
                        .text(equipo.puntos || '0', col10, y)
                        .moveDown(0.4);
                });

                // Leyenda
                doc.moveDown()
                    .fontSize(8)
                    .font('Helvetica')
                    .text('PJ: Partidos Jugados | PG: Partidos Ganados | PE: Partidos Empatados | PP: Partidos Perdidos')
                    .text('GF: Goles a Favor | GC: Goles en Contra | DG: Diferencia de Goles | Pts: Puntos');

                this.agregarPieDePagina(doc);
                doc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    static calcularEdad(fechaNacimiento) {
        const hoy = new Date();
        const nacimiento = new Date(fechaNacimiento);
        let edad = hoy.getFullYear() - nacimiento.getFullYear();
        const mes = hoy.getMonth() - nacimiento.getMonth();

        if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
            edad--;
        }

        return edad;
    }

    static agruparPorFecha(partidos) {
        return partidos.reduce((grupos, partido) => {
            const fecha = new Date(partido.fecha).toISOString().split('T')[0];
            if (!grupos[fecha]) {
                grupos[fecha] = [];
            }
            grupos[fecha].push(partido);
            return grupos;
        }, {});
    }

}

module.exports = PDFGenerator;