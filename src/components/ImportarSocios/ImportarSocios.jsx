import React, { useState } from 'react';
import { Row, Col, Card, Button, Alert, Spinner, ProgressBar } from 'react-bootstrap';
import { FaDownload, FaUpload, FaFileExcel, FaCheck, FaTimes, FaExclamationTriangle } from 'react-icons/fa';
import { useSocios } from '../../hooks/useSocios';
import { useAudit } from '../../hooks/useAudit';
import { BARRIOS, SECTORES_LABELS, ORIGENES_CONTACTO } from '../../utils/constants';
import { generarPlantillaExcel, procesarArchivoExcel } from '../../services/excelService';
import './ImportarSocios.css';

const ImportarSocios = ({ onImportarCompleto }) => {
  const { crearSocio, buscarPorDNI } = useSocios();
  const { logSocioAction } = useAudit();
  
  const [archivo, setArchivo] = useState(null);
  const [datos, setDatos] = useState([]);
  const [errores, setErrores] = useState([]);
  const [procesando, setProcesando] = useState(false);
  const [paso, setPaso] = useState(1); // 1: Descargar plantilla, 2: Subir archivo, 3: Vista previa, 4: Procesando, 5: Resultado
  const [resultados, setResultados] = useState({ 
    exitosos: 0, 
    rechazados: 0, 
    errores: [], 
    sociosExitosos: [] // Lista de socios que se importaron correctamente
  });

  // Descargar plantilla Excel
  const descargarPlantilla = () => {
    generarPlantillaExcel();
  };

  // Manejar subida de archivo
  const manejarArchivo = async (event) => {
    const archivoSeleccionado = event.target.files[0];
    if (!archivoSeleccionado) return;

    setArchivo(archivoSeleccionado);
    setProcesando(true);
    setPaso(3);

    try {
      const { datos: datosParseados, errores: erroresEncontrados } = await procesarArchivoExcel(archivoSeleccionado);
      setDatos(datosParseados);
      setErrores(erroresEncontrados);
    } catch (error) {
      setErrores([{ tipo: 'error', mensaje: 'Error al procesar el archivo: ' + error.message }]);
    } finally {
      setProcesando(false);
    }
  };

  // Procesar importación
  const procesarImportacion = async () => {
    setProcesando(true);
    setPaso(4);

    let exitosos = 0;
    let rechazados = 0;
    const erroresProcesamiento = [];
    const sociosExitosos = [];

    for (const fila of datos) {
      try {
        // Verificar si el DNI ya existe
        const socioExistente = await buscarPorDNI(fila.dni);
        if (socioExistente) {
          rechazados++;
          erroresProcesamiento.push({
            fila: fila.numeroFila,
            nombre: `${fila.nombre} ${fila.apellido}`,
            dni: fila.dni,
            motivo: 'DNI ya existe en el sistema'
          });
          continue;
        }

        // Crear el socio
        const socioCreado = await crearSocio(fila);
        exitosos++;
        
        // Agregar a la lista de exitosos
        sociosExitosos.push({
          fila: fila.numeroFila,
          nombre: `${fila.nombre} ${fila.apellido}`,
          dni: fila.dni,
          email: fila.email,
          sectores: fila.sectores.join(', ') || 'Sin sectores'
        });

        // Log de auditoría
        await logSocioAction('IMPORT_SOCIO', socioCreado.id, `${fila.nombre} ${fila.apellido}`, { 
          dni: fila.dni, 
          origen: 'importacion_excel' 
        });

      } catch (error) {
        rechazados++;
        erroresProcesamiento.push({
          fila: fila.numeroFila,
          nombre: `${fila.nombre} ${fila.apellido}`,
          dni: fila.dni,
          motivo: 'Error al crear socio: ' + error.message
        });
      }
    }

    setResultados({ exitosos, rechazados, errores: erroresProcesamiento, sociosExitosos });
    setPaso(5);
    setProcesando(false);

    // No redirigir automáticamente - siempre mostrar el reporte completo
    // El usuario puede decidir si quiere importar más o finalizar
  };

  // Reiniciar proceso
  const reiniciarProceso = () => {
    setArchivo(null);
    setDatos([]);
    setErrores([]);
    setProcesando(false);
    setPaso(1);
    setResultados({ exitosos: 0, rechazados: 0, errores: [], sociosExitosos: [] });
  };

  return (
    <div className="importar-socios">
      <Row>
        <Col>
          <Card className="opm-card">
            <Card.Header>
              <h5 className="mb-0">
                <FaFileExcel className="me-2" />
                Importar Socios desde Excel
              </h5>
            </Card.Header>
            <Card.Body>
              
              {/* Paso 1: Descargar plantilla */}
              {paso === 1 && (
                <div>
                  <div className="text-center mb-4">
                    <FaDownload size={48} className="text-primary mb-3" />
                    <h6>Paso 1: Descargar plantilla</h6>
                    <p className="text-muted mb-4">
                      Descarga la plantilla Excel con el formato correcto para importar socios.
                    </p>
                    <Button 
                      variant="primary" 
                      onClick={descargarPlantilla}
                      className="me-2"
                    >
                      <FaDownload className="me-2" />
                      Descargar Plantilla Excel
                    </Button>
                    <div className="mt-4">
                      <Button 
                        variant="outline-primary"
                        onClick={() => setPaso(2)}
                      >
                        Ya tengo la plantilla, continuar
                      </Button>
                    </div>
                  </div>

                  {/* Instrucciones */}
                  <Card className="mt-4">
                    <Card.Header>
                      <h6 className="mb-0">
                        <FaExclamationTriangle className="me-2" />
                        Instrucciones de Importación
                      </h6>
                    </Card.Header>
                    <Card.Body>
                      <Row>
                        <Col md={6}>
                          <h6 className="text-primary">Campos Obligatorios:</h6>
                          <ul className="mb-3">
                            <li><strong>Nombre</strong> - Nombre del socio</li>
                            <li><strong>Apellido</strong> - Apellido del socio</li>
                            <li><strong>DNI</strong> - Solo números, 7-8 dígitos</li>
                            <li><strong>Email</strong> - Formato usuario@dominio.com</li>
                            <li><strong>Telefono</strong> - Solo números, mínimo 8 dígitos</li>
                          </ul>

                          <h6 className="text-primary">Campos Opcionales:</h6>
                          <ul>
                            <li><strong>Fecha_Nacimiento</strong> - YYYY-MM-DD o DD/MM/YYYY</li>
                            <li><strong>Barrio</strong> - Seleccionar de la lista</li>
                            <li><strong>Direccion</strong> - Dirección completa</li>
                            <li><strong>Sectores</strong> - Separados por comas</li>
                            <li><strong>Etiquetas</strong> - Separadas por comas</li>
                            <li><strong>Origen_Contacto</strong> - Cómo nos conoció</li>
                            <li><strong>Observaciones</strong> - Notas adicionales</li>
                          </ul>
                        </Col>
                        <Col md={6}>
                          <h6 className="text-primary">Valores Válidos:</h6>
                          
                          <h6 className="text-secondary mt-3">Sectores:</h6>
                          <p className="small">{Object.values(SECTORES_LABELS).join(', ')}</p>
                          
                          <h6 className="text-secondary">Barrios:</h6>
                          <p className="small">{BARRIOS.join(', ')}</p>
                          
                          <h6 className="text-secondary">Orígenes:</h6>
                          <p className="small">{ORIGENES_CONTACTO.join(', ')}</p>

                          <Alert variant="info" className="mt-3">
                            <strong>Importante:</strong> No modifiques los nombres de las columnas. 
                            Usa comas para separar múltiples sectores/etiquetas.
                          </Alert>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>
                </div>
              )}

              {/* Paso 2: Subir archivo */}
              {paso === 2 && (
                <div className="text-center">
                  <FaUpload size={48} className="text-primary mb-3" />
                  <h6>Paso 2: Subir archivo Excel</h6>
                  <p className="text-muted mb-4">
                    Selecciona el archivo Excel que llenaste con los datos de los socios.
                  </p>
                  <input
                    type="file"
                    accept=".xlsx,.xls"
                    onChange={manejarArchivo}
                    className="form-control mb-3"
                    style={{ maxWidth: '300px', margin: '0 auto' }}
                  />
                  <div className="mt-3">
                    <Button 
                      variant="outline-secondary"
                      onClick={() => setPaso(1)}
                    >
                      Volver a descargar plantilla
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 3: Vista previa */}
              {paso === 3 && !procesando && (
                <div>
                  <h6>Paso 3: Vista previa de datos</h6>
                  
                  {errores.length > 0 && (
                    <Alert variant="warning" className="mb-3">
                      <FaExclamationTriangle className="me-2" />
                      Se encontraron {errores.length} errores en el archivo. 
                      Revisa los errores antes de continuar.
                    </Alert>
                  )}

                  <div className="mb-3">
                    <p><strong>Archivo:</strong> {archivo?.name}</p>
                    <p><strong>Registros encontrados:</strong> {datos.length}</p>
                    <p><strong>Errores encontrados:</strong> {errores.length}</p>
                  </div>

                  {datos.length > 0 && (
                    <div className="table-responsive mb-3">
                      <table className="table table-sm table-striped">
                        <thead>
                          <tr>
                            <th>Fila</th>
                            <th>Nombre</th>
                            <th>Apellido</th>
                            <th>DNI</th>
                            <th>Email</th>
                            <th>Estado</th>
                          </tr>
                        </thead>
                        <tbody>
                          {datos.slice(0, 10).map((fila, index) => (
                            <tr key={index}>
                              <td>{fila.numeroFila}</td>
                              <td>{fila.nombre}</td>
                              <td>{fila.apellido}</td>
                              <td>{fila.dni}</td>
                              <td>{fila.email}</td>
                              <td>
                                {fila.errores && fila.errores.length > 0 ? (
                                  <span className="text-danger">
                                    <FaTimes className="me-1" />
                                    Errores
                                  </span>
                                ) : (
                                  <span className="text-success">
                                    <FaCheck className="me-1" />
                                    Válido
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      {datos.length > 10 && (
                        <p className="text-muted">
                          Mostrando los primeros 10 registros de {datos.length} total.
                        </p>
                      )}
                    </div>
                  )}

                  {errores.length > 0 && (
                    <Alert variant="danger" className="mb-3">
                      <h6>Errores encontrados:</h6>
                      <ul className="mb-0">
                        {errores.slice(0, 5).map((error, index) => (
                          <li key={index}>
                            <strong>Fila {error.fila}:</strong> {error.mensaje}
                          </li>
                        ))}
                        {errores.length > 5 && (
                          <li>... y {errores.length - 5} errores más</li>
                        )}
                      </ul>
                    </Alert>
                  )}

                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary"
                      onClick={procesarImportacion}
                      disabled={errores.length > 0}
                    >
                      {errores.length > 0 ? 'Corregir errores primero' : 'Procesar Importación'}
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={reiniciarProceso}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}

              {/* Paso 4: Procesando */}
              {paso === 4 && procesando && (
                <div className="text-center">
                  <Spinner animation="border" className="mb-3" />
                  <h6>Procesando importación...</h6>
                  <p className="text-muted">
                    Importando socios a la base de datos. Por favor espera.
                  </p>
                  <ProgressBar animated now={100} className="mb-3" />
                </div>
              )}

              {/* Paso 5: Resultado */}
              {paso === 5 && (
                <div>
                  <h6>Resultado de la importación</h6>
                  
                  <Alert variant={resultados.exitosos > 0 ? "success" : "warning"}>
                    <h6>Resumen:</h6>
                    <ul className="mb-0">
                      <li><strong>Socios importados exitosamente:</strong> {resultados.exitosos}</li>
                      <li><strong>Socios rechazados:</strong> {resultados.rechazados}</li>
                    </ul>
                  </Alert>

                  {/* Socios importados exitosamente */}
                  {resultados.sociosExitosos.length > 0 && (
                    <Alert variant="success" className="mb-3">
                      <h6>
                        <FaCheck className="me-2" />
                        Socios importados exitosamente ({resultados.exitosos}):
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Fila</th>
                              <th>Nombre</th>
                              <th>DNI</th>
                              <th>Email</th>
                              <th>Sectores</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultados.sociosExitosos.map((socio, index) => (
                              <tr key={index}>
                                <td>{socio.fila}</td>
                                <td>{socio.nombre}</td>
                                <td>{socio.dni}</td>
                                <td>{socio.email}</td>
                                <td>{socio.sectores}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Alert>
                  )}

                  {/* Socios rechazados */}
                  {resultados.errores.length > 0 && (
                    <Alert variant="danger" className="mb-3">
                      <h6>
                        <FaTimes className="me-2" />
                        Socios rechazados ({resultados.rechazados}):
                      </h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Fila</th>
                              <th>Nombre</th>
                              <th>DNI</th>
                              <th>Motivo</th>
                            </tr>
                          </thead>
                          <tbody>
                            {resultados.errores.map((error, index) => (
                              <tr key={index}>
                                <td>{error.fila}</td>
                                <td>{error.nombre}</td>
                                <td>{error.dni}</td>
                                <td>{error.motivo}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </Alert>
                  )}

                  <div className="d-flex gap-2">
                    <Button 
                      variant="primary"
                      onClick={reiniciarProceso}
                    >
                      Importar más socios
                    </Button>
                    <Button 
                      variant="outline-secondary"
                      onClick={() => {
                        if (onImportarCompleto) {
                          onImportarCompleto();
                        } else {
                          window.location.reload();
                        }
                      }}
                    >
                      Finalizar
                    </Button>
                  </div>
                </div>
              )}

            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default ImportarSocios;
