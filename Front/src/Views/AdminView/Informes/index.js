import React, { useState, useEffect } from 'react';
import styles from './informes.module.css';
import Button from '../../../Components/Shared/Button';
import Modal from '../../../Components/Shared/Modal';
import Spinner from '../../../Components/Shared/Spinner';
import axiosClient from '../../../Components/Shared/Axios';
import { useModalContext } from '../../../Components/Contexts';
import { FaFilePdf, FaFileExcel, FaFileCsv, FaDownload } from 'react-icons/fa';

const Informes = () => {
  const { openModal, modalState, closeModal } = useModalContext();
  const [isLoading, setIsLoading] = useState(false);
  const [plantillas, setPlantillas] = useState([]);
  const [selectedPlantilla, setSelectedPlantilla] = useState('');
  const [formato, setFormato] = useState('pdf');
  const [filtrosDef, setFiltrosDef] = useState({});
  const [filtros, setFiltros] = useState({});
  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarPlantillas();
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

  const validarFiltros = () => {
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

  // Renderizar inputs dinámicos
  const renderFiltros = () => {
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
              {plantillas.map((plantilla) => (
                <option key={plantilla.id} value={plantilla.id}>
                  {plantilla.nombre}
                </option>
              ))}
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
      </div>
    </>
  );
};

export default Informes;
