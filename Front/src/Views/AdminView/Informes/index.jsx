import React, { useState, useEffect } from 'react';
import styles from './informes.module.css';
import Button from '../../../Components/Shared/Button';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import axiosClient from '../../../Components/Shared/Axios';
import { useModalContext } from '../../../Components/Contexts';
import {
  FaFilePdf,
  FaFileExcel,
  FaFileCsv,
  FaDownload,
  FaPlus,
  FaEdit,
  FaTrash
} from 'react-icons/fa';

// Campos configurables posibles
const CAMPOS_CONFIGURABLES = [
  { value: 'carrera', label: 'Carrera' },
  { value: 'grado', label: 'Grado' },
  { value: 'año', label: 'Año' },
  { value: 'estado_inscripcion', label: 'Estado de Inscripción' },
  { value: 'fecha_desde', label: 'Fecha Desde' },
  { value: 'fecha_hasta', label: 'Fecha Hasta' },
  { value: 'unidad_curricular', label: 'Unidad Curricular' },
  { value: 'promedio_minimo', label: 'Promedio Mínimo' },
  { value: 'porcentaje_asistencia', label: 'Porcentaje de Asistencia' }
];

const Informes = () => {
  const { openModal, modalState, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState('');
  const [formato, setFormato] = useState('pdf');
  const [filtrosDef, setFiltrosDef] = useState({});
  const [filtros, setFiltros] = useState({});
  const [errores, setErrores] = useState({});
  const [misPlantillas, setMisPlantillas] = useState([]);
  const [nombrePlantilla, setNombrePlantilla] = useState('');
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [errorPlantilla, setErrorPlantilla] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCampos, setEditCampos] = useState([]);
  const [errorEditar, setErrorEditar] = useState('');
  const [unidadesCurriculares, setUnidadesCurriculares] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [grados, setGrados] = useState([]);

  const sortedMisPlantillas = [...misPlantillas].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const sortedPlantillas = [...plantillas].sort((a, b) => a.nombre.localeCompare(b.nombre));

  useEffect(() => {
    cargarPlantillas();
    cargarMisPlantillas();
    axiosClient.get('/carreras').then((res) => setCarreras(res.data.carreras || []));
    axiosClient.get('/grados').then((res) => setGrados(res.data.grados || []));
    const fetchUnidades = async () => {
      try {
        const { data } = await axiosClient.get('/unidades-curriculares');
        setUnidadesCurriculares(data.unidades_curriculares || data || []);
      } catch (error) {
        setUnidadesCurriculares([]);
      }
    };
    fetchUnidades();
  }, []);

  useEffect(() => {
    if (selectedPlantilla) {
      cargarFiltros(selectedPlantilla);
    } else {
      setFiltrosDef({});
      setFiltros({});
      setErrores({});
    }
  }, [selectedPlantilla]);

  const cargarPlantillas = async () => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.get('/admin/informes/plantillas');
      setPlantillas(data.plantillas);
    } catch (error) {
      console.error('Error al cargar plantillas:', error);
    }
    setIsLoading(false);
  };

  const cargarFiltros = async (plantillaId) => {
    setIsLoading(true);
    try {
      const { data } = await axiosClient.get(`/admin/informes/filtros?plantilla_id=${plantillaId}`);
      setFiltrosDef(data.filtros || {});
      // Inicializar filtros con valores vacíos
      const nuevosFiltros = {};
      Object.keys(data.filtros || {}).forEach((key) => {
        nuevosFiltros[key] = '';
      });
      setFiltros(nuevosFiltros);
      setErrores({});
    } catch (error) {
      setFiltrosDef({});
      setFiltros({});
      setErrores({});
    }
    setIsLoading(false);
  };

  const handleFiltroChange = (key, value) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
    setErrores((prev) => ({ ...prev, [key]: undefined }));
  };

  // Definir campos obligatorios por plantilla
  const camposObligatorios = {
    1: ['carrera'],
    2: ['fecha_desde', 'fecha_hasta'],
    3: ['carrera', 'unidad_curricular'],
    4: ['carrera', 'unidad_curricular']
  };

  // Buscar plantilla seleccionada en ambas listas
  const plantillaSeleccionada =
    sortedMisPlantillas.find((p) => p.id === selectedPlantilla) ||
    sortedPlantillas.find((p) => p.id === selectedPlantilla);

  // Mapear campos configurables a definiciones de input
  const getCampoDef = (campo) =>
    CAMPOS_CONFIGURABLES.find((c) => c.value === campo) || {
      value: campo,
      label: campo,
      tipo: 'text'
    };

  // Renderizar inputs dinámicos
  const renderFiltros = () => {
    // Si es plantilla personalizada
    if (plantillaSeleccionada && Array.isArray(plantillaSeleccionada.campos_configurables)) {
      if (plantillaSeleccionada.campos_configurables.length === 0) return null;
      return (
        <div className={styles.formGroup}>
          <label>Filtros:</label>
          {plantillaSeleccionada.campos_configurables.map((campo) => {
            const def = getCampoDef(campo);
            // Definir tipo de input
            if (
              ['carrera', 'grado', 'estado_inscripcion', 'unidad_curricular'].includes(def.value)
            ) {
              // Opciones dummy, deberías reemplazar por datos reales si tienes
              let opciones = [];
              if (def.value === 'carrera')
                opciones = carreras.map((c) => ({
                  value: c.id_carrera,
                  label: c.carrera
                }));
              if (def.value === 'grado')
                opciones = grados.map((g) => ({
                  value: g.id_grado,
                  label: g.detalle || `Grado ${g.grado}`
                }));
              if (def.value === 'estado_inscripcion')
                opciones = [
                  { value: 'activo', label: 'Activo' },
                  { value: 'inactivo', label: 'Inactivo' }
                ];
              if (def.value === 'unidad_curricular')
                opciones = unidadesCurriculares.map((uc) => ({
                  value: uc.id_uc,
                  label: uc.unidad_curricular
                }));
              return (
                <div key={campo} className={styles.filtroField}>
                  <label>{def.label}</label>
                  <select
                    value={filtros[campo] || ''}
                    onChange={(e) => handleFiltroChange(campo, e.target.value)}
                    className={styles.select}
                  >
                    <option value="">Selecciona...</option>
                    {opciones.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                  </select>
                  {errores[campo] && <div className={styles.error}>{errores[campo]}</div>}
                </div>
              );
            }
            if (def.value === 'fecha_desde' || def.value === 'fecha_hasta') {
              return (
                <div key={campo} className={styles.filtroField}>
                  <label>{def.label}</label>
                  <input
                    type="date"
                    value={filtros[campo] || ''}
                    onChange={(e) => handleFiltroChange(campo, e.target.value)}
                    className={styles.input}
                  />
                  {errores[campo] && <div className={styles.error}>{errores[campo]}</div>}
                </div>
              );
            }
            if (def.value === 'promedio_minimo' || def.value === 'porcentaje_asistencia') {
              return (
                <div key={campo} className={styles.filtroField}>
                  <label>{def.label}</label>
                  <input
                    type="number"
                    value={filtros[campo] || ''}
                    onChange={(e) => handleFiltroChange(campo, e.target.value)}
                    className={styles.input}
                  />
                  {errores[campo] && <div className={styles.error}>{errores[campo]}</div>}
                </div>
              );
            }
            // Por defecto, input de texto
            return (
              <div key={campo} className={styles.filtroField}>
                <label>{def.label}</label>
                <input
                  type="text"
                  value={filtros[campo] || ''}
                  onChange={(e) => handleFiltroChange(campo, e.target.value)}
                  className={styles.input}
                />
                {errores[campo] && <div className={styles.error}>{errores[campo]}</div>}
              </div>
            );
          })}
        </div>
      );
    }
    // Si es plantilla del sistema, usar lógica actual
    if (!filtrosDef || Object.keys(filtrosDef).length === 0) return null;
    return (
      <div className={styles.formGroup}>
        <label>Filtros:</label>
        {Object.entries(filtrosDef).map(([key, def]) => {
          const obligatorio = (camposObligatorios[selectedPlantilla] || []).includes(key);
          if (def.tipo === 'select') {
            return (
              <div key={key} className={styles.filtroField}>
                <label>
                  {def.label} {obligatorio && <span style={{ color: 'red' }}>*</span>}
                </label>
                <select
                  value={filtros[key] || ''}
                  onChange={(e) => handleFiltroChange(key, e.target.value)}
                  className={styles.select}
                >
                  <option value="">Selecciona...</option>
                  {def.opciones &&
                    def.opciones.length > 0 &&
                    def.opciones.map((op) => (
                      <option key={op.value} value={op.value}>
                        {op.label}
                      </option>
                    ))}
                </select>
                {errores[key] && <div className={styles.error}>{errores[key]}</div>}
              </div>
            );
          }
          if (def.tipo === 'date') {
            return (
              <div key={key} className={styles.filtroField}>
                <label>
                  {def.label} {obligatorio && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  type="date"
                  value={filtros[key] || ''}
                  onChange={(e) => handleFiltroChange(key, e.target.value)}
                  className={styles.input}
                />
                {errores[key] && <div className={styles.error}>{errores[key]}</div>}
              </div>
            );
          }
          if (def.tipo === 'number') {
            return (
              <div key={key} className={styles.filtroField}>
                <label>
                  {def.label} {obligatorio && <span style={{ color: 'red' }}>*</span>}
                </label>
                <input
                  type="number"
                  value={filtros[key] || ''}
                  min={def.min}
                  max={def.max}
                  onChange={(e) => handleFiltroChange(key, e.target.value)}
                  className={styles.input}
                />
                {errores[key] && <div className={styles.error}>{errores[key]}</div>}
              </div>
            );
          }
          // Por defecto, input de texto
          return (
            <div key={key} className={styles.filtroField}>
              <label>
                {def.label} {obligatorio && <span style={{ color: 'red' }}>*</span>}
              </label>
              <input
                type="text"
                value={filtros[key] || ''}
                onChange={(e) => handleFiltroChange(key, e.target.value)}
                className={styles.input}
              />
              {errores[key] && <div className={styles.error}>{errores[key]}</div>}
            </div>
          );
        })}
      </div>
    );
  };

  // Validar filtros para plantillas personalizadas
  const validarFiltros = () => {
    if (plantillaSeleccionada && Array.isArray(plantillaSeleccionada.campos_configurables)) {
      const nuevosErrores = {};
      plantillaSeleccionada.campos_configurables.forEach((campo) => {
        if (!filtros[campo]) {
          nuevosErrores[campo] = 'Este campo es obligatorio';
        }
      });
      setErrores(nuevosErrores);
      return Object.keys(nuevosErrores).length === 0;
    }
    // Lógica original para plantillas del sistema
    const obligatorios = camposObligatorios[selectedPlantilla] || [];
    const nuevosErrores = {};
    obligatorios.forEach((campo) => {
      if (!filtros[campo]) {
        nuevosErrores[campo] = 'Este campo es obligatorio';
      }
    });
    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const generarInforme = async () => {
    if (!selectedPlantilla) {
      openModal({
        title: 'Error',
        description: 'Debes seleccionar una plantilla de informe',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
      return;
    }
    if (!validarFiltros()) {
      openModal({
        title: 'Error',
        description: 'Completa los campos obligatorios',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
      return;
    }
    setIsLoading(true);
    try {
      const response = await axiosClient.post(
        '/admin/informes/generar',
        {
          plantilla_id: selectedPlantilla,
          formato: formato,
          filtros: filtros
        },
        {
          responseType: 'blob'
        }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute(
        'download',
        `informe_${selectedPlantilla}_${new Date().toISOString().split('T')[0]}.${formato}`
      );
      document.body.appendChild(link);
      link.click();
      link.remove();
      openModal({
        description: 'Informe generado y descargado correctamente',
        chooseModal: false
      });
    } catch (error) {
      openModal({
        title: 'Error',
        description: 'Error al generar el informe',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
    }
    setIsLoading(false);
  };

  const getFormatoIcon = (formato) => {
    switch (formato) {
      case 'pdf':
        return <FaFilePdf />;
      case 'excel':
        return <FaFileExcel />;
      case 'csv':
        return <FaFileCsv />;
      default:
        return <FaFilePdf />;
    }
  };

  const cargarMisPlantillas = async () => {
    try {
      const { data } = await axiosClient.get('/plantillas-informe');
      setMisPlantillas(data);
    } catch (error) {
      setMisPlantillas([]);
    }
  };

  const handleCampoChange = (campo) => {
    setCamposSeleccionados((prev) =>
      prev.includes(campo) ? prev.filter((c) => c !== campo) : [...prev, campo]
    );
  };

  const handleCrearPlantilla = async (e) => {
    e.preventDefault();
    setErrorPlantilla('');
    if (!nombrePlantilla.trim()) {
      setErrorPlantilla('El nombre es obligatorio');
      return;
    }
    if (camposSeleccionados.length === 0) {
      setErrorPlantilla('Selecciona al menos un campo configurable');
      return;
    }
    try {
      await axiosClient.post('/plantillas-informe', {
        nombre: nombrePlantilla,
        campos_configurables: camposSeleccionados
      });
      setNombrePlantilla('');
      setCamposSeleccionados([]);
      cargarMisPlantillas();
      openModal({
        description: 'Plantilla creada correctamente',
        chooseModal: false
      });
    } catch (error) {
      setErrorPlantilla('Error al crear la plantilla');
    }
  };

  const handleEditarClick = (plantilla) => {
    setEditandoId(plantilla.id);
    setEditNombre(plantilla.nombre);
    setEditCampos(
      Array.isArray(plantilla.campos_configurables) ? plantilla.campos_configurables : []
    );
    setErrorEditar('');
  };

  const handleCancelarEditar = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditCampos([]);
    setErrorEditar('');
  };

  const handleEditarCampoChange = (campo) => {
    setEditCampos((prev) =>
      prev.includes(campo) ? prev.filter((c) => c !== campo) : [...prev, campo]
    );
  };

  const handleGuardarEdicion = async (id) => {
    setErrorEditar('');
    if (!editNombre.trim()) {
      setErrorEditar('El nombre es obligatorio');
      return;
    }
    if (editCampos.length === 0) {
      setErrorEditar('Selecciona al menos un campo configurable');
      return;
    }
    try {
      await axiosClient.put(`/plantillas-informe/${id}`, {
        nombre: editNombre,
        campos_configurables: editCampos
      });
      setEditandoId(null);
      setEditNombre('');
      setEditCampos([]);
      cargarMisPlantillas();
      openModal({
        description: 'Plantilla editada correctamente',
        chooseModal: false
      });
    } catch (error) {
      setErrorEditar('Error al editar la plantilla');
    }
  };

  const handleEliminarPlantilla = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta plantilla?')) return;
    try {
      await axiosClient.delete(`/plantillas-informe/${id}`);
      cargarMisPlantillas();
      openModal({
        description: 'Plantilla eliminada correctamente',
        chooseModal: false
      });
    } catch (error) {
      openModal({
        description: 'Error al eliminar la plantilla',
        chooseModal: false
      });
    }
  };

  // Mostrar spinner si está cargando
  if (isLoading) {
    return <Spinner />;
  }

  return (
    <>
      {modalState.isOpen && <Modal />}

      <div className={styles.informesContainer}>
        <div className={styles.header}>
          <h1>Generar Informes</h1>
          <p>Selecciona una plantilla y formato para generar tu informe</p>
        </div>

        <div className={styles.formCard}>
          <div className={styles.formGroup}>
            <label>Plantilla de Informe:</label>
            <select
              value={selectedPlantilla}
              onChange={(e) => setSelectedPlantilla(Number(e.target.value))}
              className={styles.select}
            >
              <option value="">Selecciona una plantilla</option>
              {/* Plantillas del usuario */}
              {sortedMisPlantillas.length > 0 && (
                <optgroup label="Mis Plantillas">
                  {sortedMisPlantillas.map((plantilla) => (
                    <option
                      key={`mis-${plantilla.id}`}
                      value={plantilla.id}
                      className={styles.misPlantillaOption}
                    >
                      {plantilla.nombre}
                    </option>
                  ))}
                </optgroup>
              )}
              {/* Plantillas predefinidas */}
              {sortedPlantillas.length > 0 && (
                <optgroup label="Plantillas del sistema">
                  {sortedPlantillas.map((plantilla) => (
                    <option
                      key={`sys-${plantilla.id}`}
                      value={plantilla.id}
                      className={styles.sistemaPlantillaOption}
                    >
                      {plantilla.nombre}
                    </option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Formato de Salida:</label>
            <div className={styles.formatOptions}>
              {['pdf', 'excel', 'csv'].map((fmt) => (
                <button
                  key={fmt}
                  type="button"
                  className={`${styles.formatBtn} ${formato === fmt ? styles.active : ''}`}
                  onClick={() => setFormato(fmt)}
                >
                  {getFormatoIcon(fmt)}
                  {fmt.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {renderFiltros()}

          <Button
            text="Generar y Descargar Informe"
            onClick={generarInforme}
            icon={<FaDownload />}
            className={styles.generateBtn}
          />
        </div>

        <div className={styles.plantillasSection}>
          <h2>Plantillas Disponibles</h2>
          <div className={styles.plantillasGrid}>
            {plantillas.map((plantilla) => (
              <div key={plantilla.id} className={styles.plantillaCard}>
                <h3>{plantilla.nombre}</h3>
                <p>{plantilla.descripcion}</p>
                <div className={styles.filtros}>
                  <strong>Filtros disponibles:</strong>
                  <ul>
                    {plantilla.filtros_disponibles?.map((filtro) => (
                      <li key={filtro}>{filtro}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Formulario para crear nueva plantilla */}
        <div className={styles.crearPlantillaBox}>
          <h2>
            <FaPlus /> Crear nueva plantilla de informe
          </h2>
          <form onSubmit={handleCrearPlantilla} className={styles.formPlantilla}>
            <div>
              <label>Nombre de la plantilla:</label>
              <input
                type="text"
                value={nombrePlantilla}
                onChange={(e) => setNombrePlantilla(e.target.value)}
                className={styles.input}
              />
            </div>
            <div>
              <label>Campos configurables:</label>
              <div className={styles.camposCheckboxes}>
                {CAMPOS_CONFIGURABLES.map((campo) => (
                  <label key={campo.value} className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={camposSeleccionados.includes(campo.value)}
                      onChange={() => handleCampoChange(campo.value)}
                    />
                    {campo.label}
                  </label>
                ))}
              </div>
            </div>
            {errorPlantilla && <div className={styles.error}>{errorPlantilla}</div>}
            <button type="submit" className={styles.btnCrear}>
              Crear Plantilla
            </button>
          </form>
        </div>

        {/* Sección Mis Plantillas */}
        <div className={styles.misPlantillasBox}>
          <h2>Mis Plantillas</h2>
          {misPlantillas.length === 0 ? (
            <p>No tienes plantillas creadas.</p>
          ) : (
            <ul className={styles.listaPlantillas}>
              {misPlantillas.map((p) => (
                <li key={p.id} className={styles.plantillaItem}>
                  {editandoId === p.id ? (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGuardarEdicion(p.id);
                      }}
                      className={styles.formPlantilla}
                    >
                      <input
                        type="text"
                        value={editNombre}
                        onChange={(e) => setEditNombre(e.target.value)}
                        className={styles.input}
                      />
                      <div className={styles.camposCheckboxes}>
                        {CAMPOS_CONFIGURABLES.map((campo) => (
                          <label key={campo.value} className={styles.checkboxLabel}>
                            <input
                              type="checkbox"
                              checked={editCampos.includes(campo.value)}
                              onChange={() => handleEditarCampoChange(campo.value)}
                            />
                            {campo.label}
                          </label>
                        ))}
                      </div>
                      {errorEditar && <div className={styles.error}>{errorEditar}</div>}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button type="submit" className={styles.btnCrear}>
                          <FaEdit /> Guardar
                        </button>
                        <button
                          type="button"
                          className={styles.btnCancelar}
                          onClick={handleCancelarEditar}
                        >
                          Cancelar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <strong>{p.nombre}</strong> <br />
                      <span>
                        Campos:{' '}
                        {Array.isArray(p.campos_configurables)
                          ? p.campos_configurables.join(', ')
                          : ''}
                      </span>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                        <button className={styles.btnEditar} onClick={() => handleEditarClick(p)}>
                          <FaEdit /> Editar
                        </button>
                        <button
                          className={styles.btnEliminar}
                          onClick={() => handleEliminarPlantilla(p.id)}
                        >
                          <FaTrash /> Eliminar
                        </button>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
};

export default Informes;
