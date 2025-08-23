import React, { useState, useEffect } from 'react';
import styles from './informes.module.css';
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
  FaTrash,
  FaChartBar,
  FaCog
} from 'react-icons/fa';

// Campos configurables posibles (estructura base)
const CAMPOS_CONFIGURABLES = [
  {
    value: 'carrera',
    label: 'Carrera',
    tipo: 'select',
    opciones: [] // Se cargarán dinámicamente
  },
  {
    value: 'grado',
    label: 'Año (Grado)',
    tipo: 'select',
    opciones: [] // Se cargarán dinámicamente
  },
  {
    value: 'estado_inscripcion',
    label: 'Estado de Inscripción',
    tipo: 'select',
    opciones: [
      { value: 'activa', label: 'Activa' },
      { value: 'inactiva', label: 'Inactiva' },
      { value: 'pendiente', label: 'Pendiente' }
    ]
  },
  {
    value: 'fecha_desde',
    label: 'Fecha Desde',
    tipo: 'date'
  },
  {
    value: 'fecha_hasta',
    label: 'Fecha Hasta',
    tipo: 'date'
  },
  {
    value: 'unidad_curricular',
    label: 'Unidad Curricular',
    tipo: 'select',
    opciones: [] // Se cargarán dinámicamente
  },
  {
    value: 'promedio_minimo',
    label: 'Promedio Mínimo',
    tipo: 'number',
    min: 0,
    max: 10,
    step: 0.1
  }
];

const Informes = () => {
  const { openModal, modalState, closeModal } = useModalContext();

  // Estados para la sección de Generar Informes
  const [isLoading, setIsLoading] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState('');
  const [formato, setFormato] = useState('pdf');
  const [filtrosDef, setFiltrosDef] = useState({});
  const [filtros, setFiltros] = useState({});
  const [errores, setErrores] = useState({});

  // Estados para la sección de Gestionar Plantillas
  const [misPlantillas, setMisPlantillas] = useState([]);
  const [nombrePlantilla, setNombrePlantilla] = useState('');
  const [camposSeleccionados, setCamposSeleccionados] = useState([]);
  const [errorPlantilla, setErrorPlantilla] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [editNombre, setEditNombre] = useState('');
  const [editCampos, setEditCampos] = useState([]);
  const [errorEditar, setErrorEditar] = useState('');

  // Estado para campos configurables con datos dinámicos
  const [camposConfigurables, setCamposConfigurables] = useState(CAMPOS_CONFIGURABLES);

  // Estado para controlar qué sección está activa
  const [seccionActiva, setSeccionActiva] = useState('generar'); // 'generar' o 'gestionar'

  const sortedMisPlantillas = [...misPlantillas].sort((a, b) => a.nombre.localeCompare(b.nombre));
  const sortedPlantillas = [...plantillas].sort((a, b) => a.nombre.localeCompare(b.nombre));

  useEffect(() => {
    cargarPlantillas();
    cargarMisPlantillas();
    cargarDatosFiltros();
  }, []);

  useEffect(() => {
    if (selectedPlantilla && seccionActiva === 'generar') {
      cargarFiltros(selectedPlantilla);
    } else {
      setFiltrosDef({});
      setFiltros({});
      setErrores({});
    }
  }, [selectedPlantilla, seccionActiva]);

  // Limpiar estados cuando se cambia de sección
  useEffect(() => {
    if (seccionActiva === 'generar') {
      // Limpiar estados de gestión
      setEditandoId(null);
      setEditNombre('');
      setEditCampos([]);
      setErrorEditar('');
      setNombrePlantilla('');
      setCamposSeleccionados([]);
      setErrorPlantilla('');
    } else {
      // Limpiar estados de generación
      setSelectedPlantilla('');
      setFiltrosDef({});
      setFiltros({});
      setErrores({});
    }
  }, [seccionActiva]);

  // const cargarDatosFiltros = async () => {
  //   try {
  //     const [carrerasRes, gradosRes] = await Promise.all([
  //       axiosClient.get('/carreras'),
  //       axiosClient.get('/grados')
  //     ]);

  //     setCarreras(carrerasRes.data.carreras || []);
  //     setGrados(gradosRes.data.grados || []);

  //     // Cargar unidades curriculares
  //     try {
  //       const { data } = await axiosClient.get('/unidades-curriculares');
  //       setUnidadesCurriculares(data.unidades_curriculares || data || []);
  //     } catch (error) {
  //       setUnidadesCurriculares([]);
  //     }
  //   } catch (error) {
  //     console.error('Error al cargar datos de filtros:', error);
  //   }
  // };

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
      // Determinar si es plantilla del sistema o personalizada
      const plantillaSistema = plantillas.find((p) => p.id == plantillaId);
      const plantillaPersonalizada = misPlantillas.find((p) => p.id == plantillaId);

      let nuevosFiltrosDef = {};

      if (plantillaSistema) {
        // Es una plantilla del sistema
        const { data } = await axiosClient.get(
          `/admin/informes/filtros?plantilla_id=${plantillaId}`
        );
        nuevosFiltrosDef = data.filtros || {};
      } else if (plantillaPersonalizada) {
        // Es una plantilla personalizada
        plantillaPersonalizada.campos_configurables?.forEach((campo) => {
          const campoConfig = camposConfigurables.find((c) => c.value === campo);
          nuevosFiltrosDef[campo] = {
            label: campoConfig?.label || campo,
            tipo: campoConfig?.tipo || 'text',
            required: false,
            opciones: campoConfig?.opciones || undefined,
            min: campoConfig?.min || undefined,
            max: campoConfig?.max || undefined,
            step: campoConfig?.step || undefined
          };
        });
      }

      setFiltrosDef(nuevosFiltrosDef);

      // Inicializar filtros con valores vacíos
      const nuevosFiltros = {};
      Object.keys(nuevosFiltrosDef).forEach((key) => {
        nuevosFiltros[key] = '';
      });
      setFiltros(nuevosFiltros);
      setErrores({});
    } catch (error) {
      console.error('Error al cargar filtros:', error);
      setFiltrosDef({});
      setFiltros({});
    }
    setIsLoading(false);
  };

  const cargarMisPlantillas = async () => {
    try {
      const { data } = await axiosClient.get('/admin/informes/mis-plantillas');
      setMisPlantillas(data.plantillas || []);
    } catch (error) {
      console.error('Error al cargar mis plantillas:', error);
      setMisPlantillas([]);
    }
  };

  const cargarDatosFiltros = async () => {
    try {
      // Cargar datos dinámicos de la API
      const [carrerasResponse, gradosResponse, unidadesResponse] = await Promise.all([
        axiosClient.get('/carreras'),
        axiosClient.get('/grados'),
        axiosClient.get('/unidades-curriculares')
      ]);

      // Extraer datos según la estructura de respuesta de cada API
      const carrerasData = carrerasResponse.data.success
        ? carrerasResponse.data.carreras
        : carrerasResponse.data;
      const gradosData = gradosResponse.data; // Esta API devuelve array directo
      const unidadesData = unidadesResponse.data; // Esta API devuelve array directo

      // Actualizar campos configurables con datos dinámicos
      const camposActualizados = CAMPOS_CONFIGURABLES.map((campo) => {
        switch (campo.value) {
          case 'carrera':
            return {
              ...campo,
              opciones: Array.isArray(carrerasData)
                ? carrerasData.map((c) => ({
                    value: c.id_carrera,
                    label: c.carrera
                  }))
                : []
            };
          case 'grado':
            return {
              ...campo,
              opciones: Array.isArray(gradosData)
                ? [
                    { value: 'todos', label: 'Todos los años' },
                    ...gradosData.map((g) => ({
                      value: g.id_grado,
                      label: `${g.grado}-${g.division}°`
                    }))
                  ]
                : [{ value: 'todos', label: 'Todos los años' }]
            };
          case 'unidad_curricular':
            return {
              ...campo,
              opciones: Array.isArray(unidadesData)
                ? unidadesData.map((u) => ({
                    value: u.id_uc,
                    label: u.unidad_curricular
                  }))
                : []
            };
          default:
            return campo;
        }
      });

      setCamposConfigurables(camposActualizados);
    } catch (error) {
      console.error('Error al cargar datos de filtros:', error);
    }
  };

  const validarFiltros = () => {
    const nuevosErrores = {};

    Object.keys(filtrosDef).forEach((key) => {
      const filtro = filtrosDef[key];
      const valor = filtros[key];

      if (filtro.required && (!valor || valor.toString().trim() === '')) {
        nuevosErrores[key] = `${filtro.label} es obligatorio`;
      }

      // Validaciones específicas
      if (filtro.tipo === 'date' && valor) {
        const fecha = new Date(valor);
        if (isNaN(fecha.getTime())) {
          nuevosErrores[key] = `${filtro.label} debe ser una fecha válida`;
        }
      }

      if (filtro.tipo === 'number' && valor) {
        if (isNaN(Number(valor))) {
          nuevosErrores[key] = `${filtro.label} debe ser un número válido`;
        }
      }
    });

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const aplicarFiltros = () => {
    if (validarFiltros()) {
      // Los filtros son válidos, se pueden aplicar
      openModal({
        title: 'Filtros Aplicados',
        description: 'Los filtros se han aplicado correctamente. Puedes generar el informe.',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
    } else {
      openModal({
        title: 'Error en Filtros',
        description: 'Por favor, completa los campos obligatorios correctamente.',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
    }
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
        description: 'Completa los campos obligatorios correctamente',
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

  const handleCrearPlantilla = async () => {
    if (!nombrePlantilla.trim()) {
      setErrorPlantilla('El nombre de la plantilla es obligatorio');
      return;
    }

    if (camposSeleccionados.length === 0) {
      setErrorPlantilla('Debes seleccionar al menos un campo');
      return;
    }

    setErrorPlantilla('');
    setIsLoading(true);

    try {
      // Crear plantilla en la base de datos
      const { data } = await axiosClient.post('/admin/informes/plantillas', {
        nombre: nombrePlantilla.trim(),
        campos: camposSeleccionados,
        descripcion: `Plantilla personalizada con ${camposSeleccionados.length} campos`
      });

      // Agregar la nueva plantilla a la lista
      setMisPlantillas([...misPlantillas, data.plantilla]);

      // Limpiar formulario
      setNombrePlantilla('');
      setCamposSeleccionados([]);

      openModal({
        title: 'Éxito',
        description: 'Plantilla creada correctamente. Ya puedes usarla en "Generar Informes".',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
    } catch (error) {
      console.error('Error al crear plantilla:', error);
      openModal({
        title: 'Error',
        description: 'Error al crear la plantilla. Inténtalo de nuevo.',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditarPlantilla = (plantilla) => {
    setEditandoId(plantilla.id);
    setEditNombre(plantilla.nombre);
    setEditCampos(plantilla.campos_configurables || []);
    setErrorEditar('');
  };

  const handleGuardarEdicion = async () => {
    if (!editNombre.trim()) {
      setErrorEditar('El nombre de la plantilla es obligatorio');
      return;
    }

    if (editCampos.length === 0) {
      setErrorEditar('Debes seleccionar al menos un campo');
      return;
    }

    setErrorEditar('');
    setIsLoading(true);

    try {
      // Actualizar plantilla en la base de datos
      const { data } = await axiosClient.put(`/admin/informes/plantillas/${editandoId}`, {
        nombre: editNombre.trim(),
        campos: editCampos,
        descripcion: `Plantilla personalizada con ${editCampos.length} campos`
      });

      // Actualizar la plantilla en la lista
      const plantillasActualizadas = misPlantillas.map((plantilla) => {
        if (plantilla.id === editandoId) {
          return data.plantilla;
        }
        return plantilla;
      });

      setMisPlantillas(plantillasActualizadas);

      openModal({
        title: 'Éxito',
        description: 'Plantilla actualizada correctamente',
        confirmBtn: 'Aceptar',
        onClick: () => {
          closeModal();
          setEditandoId(null);
          setEditNombre('');
          setEditCampos([]);
        },
        noButton: false,
        confirmModal: true
      });
    } catch (error) {
      console.error('Error al actualizar plantilla:', error);
      openModal({
        title: 'Error',
        description: 'Error al actualizar la plantilla. Inténtalo de nuevo.',
        confirmBtn: 'Aceptar',
        onClick: closeModal,
        noButton: false,
        confirmModal: true
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelarEdicion = () => {
    setEditandoId(null);
    setEditNombre('');
    setEditCampos([]);
    setErrorEditar('');
  };

  const handleEliminarPlantilla = (plantilla) => {
    openModal({
      title: 'Confirmar eliminación',
      description: `¿Estás seguro de que quieres eliminar la plantilla "${plantilla.nombre}"?`,
      confirmBtn: 'Eliminar',
      cancelBtn: 'Cancelar',
      onClick: async () => {
        setIsLoading(true);
        try {
          // Eliminar plantilla de la base de datos
          await axiosClient.delete(`/admin/informes/plantillas/${plantilla.id}`);

          // Eliminar la plantilla de la lista
          const plantillasActualizadas = misPlantillas.filter((p) => p.id !== plantilla.id);
          setMisPlantillas(plantillasActualizadas);

          openModal({
            title: 'Éxito',
            description: 'Plantilla eliminada correctamente',
            confirmBtn: 'Aceptar',
            onClick: closeModal,
            noButton: false,
            confirmModal: true
          });
        } catch (error) {
          console.error('Error al eliminar plantilla:', error);
          openModal({
            title: 'Error',
            description: 'Error al eliminar la plantilla. Inténtalo de nuevo.',
            confirmBtn: 'Aceptar',
            onClick: closeModal,
            noButton: false,
            confirmModal: true
          });
        } finally {
          setIsLoading(false);
        }
      },
      noButton: false,
      confirmModal: true
    });
  };

  const handleFiltroChange = (key, value) => {
    setFiltros({ ...filtros, [key]: value });
    // Limpiar error específico cuando el usuario cambia el valor
    if (errores[key]) {
      setErrores({ ...errores, [key]: undefined });
    }
  };

  const renderFiltro = (key, filtro) => {
    const valor = filtros[key] || '';
    const error = errores[key];

    switch (filtro.tipo) {
      case 'select':
        return (
          <div key={key} className={styles.filtroItem}>
            <label className={styles.filtroLabel}>
              {filtro.label} {filtro.required && <span className={styles.required}>*</span>}
            </label>
            <select
              value={valor}
              onChange={(e) => handleFiltroChange(key, e.target.value)}
              className={`${styles.filtroInput} ${error ? styles.error : ''}`}
            >
              <option value="">Seleccionar...</option>
              {filtro.opciones?.map((opcion) => (
                <option key={opcion.value} value={opcion.value}>
                  {opcion.label}
                </option>
              ))}
            </select>
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'date':
        return (
          <div key={key} className={styles.filtroItem}>
            <label className={styles.filtroLabel}>
              {filtro.label} {filtro.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="date"
              value={valor}
              onChange={(e) => handleFiltroChange(key, e.target.value)}
              className={`${styles.filtroInput} ${error ? styles.error : ''}`}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      case 'number':
        return (
          <div key={key} className={styles.filtroItem}>
            <label className={styles.filtroLabel}>
              {filtro.label} {filtro.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="number"
              value={valor}
              onChange={(e) => handleFiltroChange(key, e.target.value)}
              className={`${styles.filtroInput} ${error ? styles.error : ''}`}
              min={filtro.min}
              max={filtro.max}
              step={filtro.step}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );

      default:
        return (
          <div key={key} className={styles.filtroItem}>
            <label className={styles.filtroLabel}>
              {filtro.label} {filtro.required && <span className={styles.required}>*</span>}
            </label>
            <input
              type="text"
              value={valor}
              onChange={(e) => handleFiltroChange(key, e.target.value)}
              className={`${styles.filtroInput} ${error ? styles.error : ''}`}
              placeholder={filtro.placeholder}
            />
            {error && <span className={styles.errorText}>{error}</span>}
          </div>
        );
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Gestión de Informes</h1>
        <p>Genera informes y gestiona plantillas personalizadas</p>
      </div>

      {/* Navegación entre secciones */}
      <div className={styles.navigation}>
        <button
          className={`${styles.navButton} ${seccionActiva === 'generar' ? styles.active : ''}`}
          onClick={() => setSeccionActiva('generar')}
        >
          <FaChartBar />
          Generar Informes
        </button>
        <button
          className={`${styles.navButton} ${seccionActiva === 'gestionar' ? styles.active : ''}`}
          onClick={() => setSeccionActiva('gestionar')}
        >
          <FaCog />
          Gestionar Plantillas
        </button>
      </div>

      {/* Sección: Generar Informes */}
      {seccionActiva === 'generar' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Generar Informe</h2>
            <p>Selecciona una plantilla y configura los filtros para generar tu informe</p>
          </div>

          <div className={styles.generarContainer}>
            {/* Selección de plantilla */}
            <div className={styles.plantillaSection}>
              <h3>1. Seleccionar Plantilla</h3>
              <select
                value={selectedPlantilla}
                onChange={(e) => setSelectedPlantilla(e.target.value)}
                className={styles.plantillaSelect}
              >
                <option value="">Seleccionar plantilla...</option>

                {/* Plantillas del sistema */}
                {sortedPlantillas.length > 0 && (
                  <optgroup label="Plantillas del Sistema">
                    {sortedPlantillas.map((plantilla) => (
                      <option key={`sys-${plantilla.id}`} value={plantilla.id}>
                        {plantilla.nombre}
                      </option>
                    ))}
                  </optgroup>
                )}

                {/* Plantillas personalizadas */}
                {sortedMisPlantillas.length > 0 && (
                  <optgroup label="Mis Plantillas">
                    {sortedMisPlantillas.map((plantilla) => (
                      <option key={`custom-${plantilla.id}`} value={plantilla.id}>
                        {plantilla.nombre}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
              {selectedPlantilla && (
                <p className={styles.plantillaDesc}>
                  {plantillas.find((p) => p.id == selectedPlantilla)?.descripcion ||
                    misPlantillas.find((p) => p.id == selectedPlantilla)?.descripcion ||
                    'Plantilla personalizada'}
                </p>
              )}
            </div>

            {/* Configuración de filtros */}
            {selectedPlantilla && (
              <div className={styles.filtrosSection}>
                <h3>2. Configurar Filtros</h3>
                <div className={styles.filtrosGrid}>
                  {Object.keys(filtrosDef).map((key) => renderFiltro(key, filtrosDef[key]))}
                </div>
                <div className={styles.aplicarFiltrosButton}>
                  <button onClick={aplicarFiltros} className={styles.aplicarBtn}>
                    <FaCog />
                    Aplicar Filtros
                  </button>
                </div>
              </div>
            )}

            {/* Configuración de formato */}
            {selectedPlantilla && (
              <div className={styles.formatoSection}>
                <h3>3. Seleccionar Formato</h3>
                <div className={styles.formatoOptions}>
                  {['pdf', 'excel', 'csv'].map((fmt) => (
                    <button
                      key={fmt}
                      className={`${styles.formatoButton} ${formato === fmt ? styles.active : ''}`}
                      onClick={() => setFormato(fmt)}
                    >
                      {getFormatoIcon(fmt)}
                      {fmt.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Botón de generación */}
            {selectedPlantilla && (
              <div className={styles.generarButton}>
                <button
                  onClick={generarInforme}
                  disabled={isLoading}
                  className={styles.generateBtn}
                >
                  {isLoading ? <Spinner /> : <FaDownload />}
                  {isLoading ? 'Generando...' : 'Generar Informe'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Sección: Gestionar Plantillas */}
      {seccionActiva === 'gestionar' && (
        <div className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Gestionar Plantillas</h2>
            <p>Crea, edita y elimina plantillas de informes personalizadas</p>
          </div>

          <div className={styles.gestionarContainer}>
            {/* Crear nueva plantilla (solo si no está editando) */}
            {!editandoId && (
              <div className={styles.crearPlantilla}>
                <h3>Crear Nueva Plantilla</h3>
                <div className={styles.crearForm}>
                  <div className={styles.inputGroup}>
                    <label>Nombre de la plantilla:</label>
                    <input
                      type="text"
                      value={nombrePlantilla}
                      onChange={(e) => setNombrePlantilla(e.target.value)}
                      placeholder="Ej: Informe de Alumnos por Carrera"
                      className={errorPlantilla ? styles.error : ''}
                    />
                    {errorPlantilla && <span className={styles.errorText}>{errorPlantilla}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Filtros a incluir en la plantilla:</label>
                    <div className={styles.camposGrid}>
                      {camposConfigurables.map((campo) => (
                        <label key={campo.value} className={styles.campoCheckbox}>
                          <input
                            type="checkbox"
                            checked={camposSeleccionados.includes(campo.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setCamposSeleccionados([...camposSeleccionados, campo.value]);
                              } else {
                                setCamposSeleccionados(
                                  camposSeleccionados.filter((c) => c !== campo.value)
                                );
                              }
                            }}
                          />
                          {campo.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <button onClick={handleCrearPlantilla} className={styles.createBtn}>
                    <FaPlus />
                    Crear Plantilla
                  </button>
                </div>
              </div>
            )}

            {/* Editar plantilla existente */}
            {editandoId && (
              <div className={styles.editarPlantilla}>
                <h3>Editar Plantilla</h3>
                <div className={styles.editarForm}>
                  <div className={styles.inputGroup}>
                    <label>Nombre de la plantilla:</label>
                    <input
                      type="text"
                      value={editNombre}
                      onChange={(e) => setEditNombre(e.target.value)}
                      className={errorEditar ? styles.error : ''}
                    />
                    {errorEditar && <span className={styles.errorText}>{errorEditar}</span>}
                  </div>

                  <div className={styles.inputGroup}>
                    <label>Filtros a incluir:</label>
                    <div className={styles.camposGrid}>
                      {camposConfigurables.map((campo) => (
                        <label key={campo.value} className={styles.campoCheckbox}>
                          <input
                            type="checkbox"
                            checked={editCampos.includes(campo.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setEditCampos([...editCampos, campo.value]);
                              } else {
                                setEditCampos(editCampos.filter((c) => c !== campo.value));
                              }
                            }}
                          />
                          {campo.label}
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className={styles.editarButtons}>
                    <button onClick={handleGuardarEdicion} className={styles.saveBtn}>
                      <FaEdit />
                      Guardar Cambios
                    </button>
                    <button onClick={handleCancelarEdicion} className={styles.cancelBtn}>
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Lista de plantillas existentes */}
            <div className={styles.plantillasList}>
              <h3>Mis Plantillas</h3>
              {sortedMisPlantillas.length === 0 ? (
                <p className={styles.noPlantillas}>No tienes plantillas personalizadas</p>
              ) : (
                <div className={styles.plantillasGrid}>
                  {sortedMisPlantillas.map((plantilla) => (
                    <div key={plantilla.id} className={styles.plantillaCard}>
                      <div className={styles.plantillaInfo}>
                        <h4>{plantilla.nombre}</h4>
                        <p>{plantilla.campos?.length || 0} campos configurados</p>
                      </div>
                      <div className={styles.plantillaActions}>
                        <button
                          onClick={() => handleEditarPlantilla(plantilla)}
                          className={styles.editBtn}
                          disabled={editandoId}
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleEliminarPlantilla(plantilla)}
                          className={styles.deleteBtn}
                          disabled={editandoId}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={modalState.isOpen}
        onClose={closeModal}
        title={modalState.title}
        description={modalState.description}
        confirmBtn={modalState.confirmBtn}
        cancelBtn={modalState.cancelBtn}
        onClick={modalState.onClick}
        noButton={modalState.noButton}
        confirmModal={modalState.confirmModal}
        chooseModal={modalState.chooseModal}
      />
    </div>
  );
};

export default Informes;
