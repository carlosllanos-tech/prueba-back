const ExcelJS = require('exceljs');
const PDFGenerator = require('./pdfGenerator');

class ExcelGenerator {

    static crearWorkbook() {
        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Torneos Deportivos';
        workbook.created = new Date();
        return workbook;
    }

    static get estilos() {
        return {
            encabezado: {
                font: { bold: true, size: 14, color: { argb: 'FFFFFFFF' } },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF0066CC' } },
                alignment: { vertical: 'middle', horizontal: 'center' }
            },
            subencabezado: {
                font: { bold: true, size: 11 },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFD9E1F2' } },
                alignment: { vertical: 'middle', horizontal: 'center' }
            },
            celda: {
                alignment: { vertical: 'middle', horizontal: 'left' }
            },
            celdaCentrada: {
                alignment: { vertical: 'middle', horizontal: 'center' }
            },
            resaltado: {
                font: { bold: true },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFF2CC' } }
            }
        };
    }

    static async generarReporteEquiposPorTorneo(torneo, equipos) {
        try {
            const workbook = this.crearWorkbook();
            const worksheet = workbook.addWorksheet('Equipos');

            // Título del reporte
            worksheet.mergeCells('A1:F1');
            worksheet.getCell('A1').value = `Equipos del Torneo: ${torneo.nombre}`;
            worksheet.getCell('A1').style = this.estilos.encabezado;
            worksheet.getRow(1).height = 25;

            // Información del torneo
            worksheet.mergeCells('A2:F2');
            worksheet.getCell('A2').value = `${torneo.disciplina} - ${torneo.temporada || ''} | Estado: ${torneo.estado}`;
            worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.getRow(2).height = 20;

            // Espacio
            worksheet.addRow([]);

            // Encabezados de columnas
            const headerRow = worksheet.addRow([
                'Nº',
                'Nombre del Equipo',
                'Color',
                'Representante',
                'Teléfono',
                'Total Jugadores'
            ]);

            headerRow.eachCell((cell) => {
                cell.style = this.estilos.subencabezado;
            });
            headerRow.height = 20;

            // Datos de equipos
            equipos.forEach((equipo, index) => {
                const row = worksheet.addRow([
                    index + 1,
                    equipo.nombre,
                    equipo.color || 'N/A',
                    equipo.representante || 'N/A',
                    equipo.telefono_representante || 'N/A',
                    equipo.total_jugadores || 0
                ]);

                row.eachCell((cell, colNumber) => {
                    if (colNumber === 1 || colNumber === 6) {
                        cell.style = this.estilos.celdaCentrada;
                    } else {
                        cell.style = this.estilos.celda;
                    }
                });
            });

            // Resumen al final
            const resumenRow = worksheet.addRow([]);
            resumenRow.height = 5;

            const totalRow = worksheet.addRow([
                'TOTAL DE EQUIPOS:',
                equipos.length
            ]);
            totalRow.getCell(1).style = this.estilos.resaltado;
            totalRow.getCell(2).style = this.estilos.resaltado;

            // Ajustar anchos de columna
            worksheet.getColumn(1).width = 8;
            worksheet.getColumn(2).width = 30;
            worksheet.getColumn(3).width = 15;
            worksheet.getColumn(4).width = 25;
            worksheet.getColumn(5).width = 18;
            worksheet.getColumn(6).width = 18;

            // Retornar el buffer
            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            throw new Error(`Error al generar reporte Excel: ${error.message}`);
        }
    }

    static async generarReporteJugadoresPorEquipo(equipo, jugadores) {
        try {
            const workbook = this.crearWorkbook();
            const worksheet = workbook.addWorksheet('Jugadores');

            // Título
            worksheet.mergeCells('A1:G1');
            worksheet.getCell('A1').value = `Plantel del Equipo: ${equipo.nombre}`;
            worksheet.getCell('A1').style = this.estilos.encabezado;
            worksheet.getRow(1).height = 25;

            // Subtítulo
            worksheet.mergeCells('A2:G2');
            worksheet.getCell('A2').value = `Torneo: ${equipo.torneo_nombre} | Representante: ${equipo.representante || 'N/A'}`;
            worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.getRow(2).height = 20;

            worksheet.addRow([]);

            // Encabezados
            const headerRow = worksheet.addRow([
                'Nro. Camiseta',
                'Nombre',
                'Apellido',
                'Fecha Nacimiento',
                'Edad',
                'Posición',
                'Fecha Registro'
            ]);

            headerRow.eachCell((cell) => {
                cell.style = this.estilos.subencabezado;
            });
            headerRow.height = 20;

            // Datos de jugadores
            jugadores.forEach((jugador) => {
                const edad = jugador.fecha_nacimiento
                    ? PDFGenerator.calcularEdad(jugador.fecha_nacimiento)
                    : 'N/A';

                const row = worksheet.addRow([
                    jugador.nro_camiseta,
                    jugador.nombre,
                    jugador.apellido,
                    jugador.fecha_nacimiento
                        ? new Date(jugador.fecha_nacimiento).toLocaleDateString('es-BO')
                        : 'N/A',
                    edad,
                    jugador.posicion || 'N/A',
                    new Date(jugador.creado_en).toLocaleDateString('es-BO')
                ]);

                row.getCell(1).style = this.estilos.celdaCentrada;
                row.getCell(5).style = this.estilos.celdaCentrada;
            });

            // Resumen
            worksheet.addRow([]);
            const totalRow = worksheet.addRow([
                'TOTAL DE JUGADORES:',
                jugadores.length
            ]);
            totalRow.getCell(1).style = this.estilos.resaltado;
            totalRow.getCell(2).style = this.estilos.resaltado;

            // Ajustar columnas
            worksheet.getColumn(1).width = 15;
            worksheet.getColumn(2).width = 20;
            worksheet.getColumn(3).width = 20;
            worksheet.getColumn(4).width = 18;
            worksheet.getColumn(5).width = 10;
            worksheet.getColumn(6).width = 18;
            worksheet.getColumn(7).width = 18;

            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            throw new Error(`Error al generar reporte Excel: ${error.message}`);
        }
    }

    static async generarReporteFixture(torneo, partidos) {
        try {
            const workbook = this.crearWorkbook();
            const worksheet = workbook.addWorksheet('Fixture');

            // Título
            worksheet.mergeCells('A1:H1');
            worksheet.getCell('A1').value = `Fixture y Resultados: ${torneo.nombre}`;
            worksheet.getCell('A1').style = this.estilos.encabezado;
            worksheet.getRow(1).height = 25;

            // Subtítulo
            worksheet.mergeCells('A2:H2');
            worksheet.getCell('A2').value = `${torneo.disciplina} - ${torneo.temporada || ''}`;
            worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.getRow(2).height = 20;

            worksheet.addRow([]);

            // Encabezados
            const headerRow = worksheet.addRow([
                'Fecha',
                'Hora',
                'Equipo Local',
                'Marcador',
                'Equipo Visitante',
                'Lugar',
                'Estado',
                'Observaciones'
            ]);

            headerRow.eachCell((cell) => {
                cell.style = this.estilos.subencabezado;
            });
            headerRow.height = 20;

            // Datos de partidos
            partidos.forEach((partido) => {
                const fecha = new Date(partido.fecha);
                const marcador = partido.estado === 'finalizado'
                    ? `${partido.marcador_local} - ${partido.marcador_visitante}`
                    : '-';

                const row = worksheet.addRow([
                    fecha.toLocaleDateString('es-BO'),
                    fecha.toLocaleTimeString('es-BO', { hour: '2-digit', minute: '2-digit' }),
                    partido.equipo_local_nombre,
                    marcador,
                    partido.equipo_visitante_nombre,
                    partido.lugar || 'Por definir',
                    partido.estado.toUpperCase(),
                    partido.observaciones || ''
                ]);

                // Colorear según estado
                if (partido.estado === 'finalizado') {
                    row.getCell(7).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFC6EFCE' }
                    };
                } else if (partido.estado === 'en_curso') {
                    row.getCell(7).fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFEB9C' }
                    };
                }

                row.getCell(4).style = this.estilos.celdaCentrada;
            });

            // Ajustar columnas
            worksheet.getColumn(1).width = 12;
            worksheet.getColumn(2).width = 10;
            worksheet.getColumn(3).width = 25;
            worksheet.getColumn(4).width = 12;
            worksheet.getColumn(5).width = 25;
            worksheet.getColumn(6).width = 20;
            worksheet.getColumn(7).width = 15;
            worksheet.getColumn(8).width = 30;

            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            throw new Error(`Error al generar reporte Excel: ${error.message}`);
        }
    }

    static async generarReporteTablaPosiciones(torneo, tablaPosiciones) {
        try {
            const workbook = this.crearWorkbook();
            const worksheet = workbook.addWorksheet('Tabla de Posiciones');

            // Título
            worksheet.mergeCells('A1:J1');
            worksheet.getCell('A1').value = `Tabla de Posiciones: ${torneo.nombre}`;
            worksheet.getCell('A1').style = this.estilos.encabezado;
            worksheet.getRow(1).height = 25;

            // Subtítulo
            worksheet.mergeCells('A2:J2');
            worksheet.getCell('A2').value = `Actualizado: ${new Date().toLocaleString('es-BO')}`;
            worksheet.getCell('A2').alignment = { horizontal: 'center' };
            worksheet.getRow(2).height = 20;

            worksheet.addRow([]);

            // Encabezados
            const headerRow = worksheet.addRow([
                'Pos',
                'Equipo',
                'PJ',
                'PG',
                'PE',
                'PP',
                'GF',
                'GC',
                'DG',
                'Pts'
            ]);

            headerRow.eachCell((cell) => {
                cell.style = this.estilos.subencabezado;
            });
            headerRow.height = 20;

            // Datos de la tabla
            tablaPosiciones.forEach((equipo, index) => {
                const row = worksheet.addRow([
                    index + 1,
                    equipo.equipo_nombre,
                    equipo.partidos_jugados || 0,
                    equipo.partidos_ganados || 0,
                    equipo.partidos_empatados || 0,
                    equipo.partidos_perdidos || 0,
                    equipo.goles_favor || 0,
                    equipo.goles_contra || 0,
                    equipo.diferencia_goles || 0,
                    equipo.puntos || 0
                ]);

                // Resaltar primeros 3 lugares
                if (index < 3) {
                    row.eachCell((cell, colNumber) => {
                        if (colNumber === 1 || colNumber === 10) {
                            cell.font = { bold: true };
                            cell.fill = {
                                type: 'pattern',
                                pattern: 'solid',
                                fgColor: { argb: 'FFFFD966' }
                            };
                        } else {
                            cell.font = { bold: true };
                        }
                    });
                }

                // Centrar valores numéricos
                for (let i = 1; i <= 10; i++) {
                    if (i !== 2) {
                        row.getCell(i).alignment = { horizontal: 'center' };
                    }
                }
            });

            // Leyenda
            worksheet.addRow([]);
            const leyendaRow = worksheet.addRow([
                'Leyenda:',
                'PJ=Partidos Jugados, PG=Partidos Ganados, PE=Partidos Empatados, PP=Partidos Perdidos'
            ]);
            worksheet.mergeCells(leyendaRow.number, 2, leyendaRow.number, 10);
            leyendaRow.getCell(1).font = { bold: true };

            // Ajustar columnas
            worksheet.getColumn(1).width = 6;
            worksheet.getColumn(2).width = 30;
            worksheet.getColumn(3).width = 8;
            worksheet.getColumn(4).width = 8;
            worksheet.getColumn(5).width = 8;
            worksheet.getColumn(6).width = 8;
            worksheet.getColumn(7).width = 8;
            worksheet.getColumn(8).width = 8;
            worksheet.getColumn(9).width = 8;
            worksheet.getColumn(10).width = 10;

            return await workbook.xlsx.writeBuffer();
        } catch (error) {
            throw new Error(`Error al generar reporte Excel: ${error.message}`);
        }
    }

}

module.exports = ExcelGenerator;