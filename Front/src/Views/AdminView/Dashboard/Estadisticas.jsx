import React, { useState, useEffect } from 'react';
import axiosClient from '../../../Components/Shared/Axios';
import Spinner from '../../../Components/Shared/Spinner';
import styles from './dashboard.module.css';

const Estadisticas = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    inscripciones: {},
    academico: {},
    alumnos: {},
    encuestas: {},
    sistema: {}
  });
  const [selectedPeriod, setSelectedPeriod] = useState('all');
  const [selectedCarrera, setSelectedCarrera] = useState('all');

  useEffect(() => {
    cargarEstadisticas();
  }, [selectedPeriod, selectedCarrera]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      setError(''); // Limpiar error anterior

      // Debug: verificar token
      const token = sessionStorage.getItem('ACCESS_TOKEN');
      const role = sessionStorage.getItem('role');
      console.log('Token:', token ? 'Existe' : 'No existe');
      console.log('Role:', role);

      const response = await axiosClient.get('/admin/estadisticas', {
        params: {
          periodo: selectedPeriod,
          carrera: selectedCarrera
        }
      });

      console.log('Respuesta del servidor:', response.data);

      if (response.data.success) {
        setStats(response.data.estadisticas);
      } else {
        setError('Error al cargar las estadísticas');
      }
    } catch (err) {
      console.error('Error completo:', err);
      console.error('Respuesta del error:', err.response);

      if (err.response) {
        setError(
          `Error ${err.response.status}: ${err.response.data?.message || 'Error del servidor'}`
        );
      } else if (err.request) {
        setError('Error al conectar con el servidor - Sin respuesta');
      } else {
        setError('Error al configurar la petición');
      }

      // No usar datos de ejemplo, mostrar error real
      console.error('Error al cargar estadísticas:', err);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <div className={`${styles.statCard} ${styles[color]}`}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statContent}>
        <h3>{title}</h3>
        <div className={styles.statValue}>{value}</div>
        {subtitle && <div className={styles.statSubtitle}>{subtitle}</div>}
        {trend && (
          <div className={`${styles.statTrend} ${trend > 0 ? styles.positive : styles.negative}`}>
            {trend > 0 ? '📈' : '📉'} {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );

  const ChartCard = ({ title, children }) => (
    <div className={styles.chartCard}>
      <h3 className={styles.chartTitle}>{title}</h3>
      <div className={styles.chartContent}>{children}</div>
    </div>
  );

  if (loading) return <Spinner />;

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={cargarEstadisticas} className={styles.btn}>
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className={styles.estadisticasContainer}>
      <div className={styles.estadisticasHeader}>
        <h2>📊 Estadísticas del Sistema</h2>
        <div className={styles.filtros}>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className={styles.filtroSelect}
          >
            <option value="all">Todos los períodos</option>
            <option value="current">Período actual</option>
            <option value="last_month">Último mes</option>
            <option value="last_quarter">Último trimestre</option>
            <option value="last_year">Último año</option>
          </select>

          <select
            value={selectedCarrera}
            onChange={(e) => setSelectedCarrera(e.target.value)}
            className={styles.filtroSelect}
          >
            <option value="all">Todas las carreras</option>
            <option value="1">Análisis Funcional</option>
            <option value="2">Desarrollo de Software</option>
            <option value="3">Infraestructura de TI</option>
          </select>

          <button
            onClick={cargarEstadisticas}
            className={styles.btn}
            disabled={loading}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              fontSize: '14px'
            }}
          >
            {loading ? '🔄 Cargando...' : '🔍 Aplicar Filtros'}
          </button>
        </div>

        {/* Indicador de filtros activos */}
        {(selectedPeriod !== 'all' || selectedCarrera !== 'all') && (
          <div
            style={{
              background: '#e3f2fd',
              border: '1px solid #2196f3',
              borderRadius: '8px',
              padding: '12px',
              marginTop: '16px',
              fontSize: '14px',
              color: '#1976d2'
            }}
          >
            🔍 <strong>Filtros activos:</strong>
            {selectedPeriod !== 'all' &&
              ` Período: ${selectedPeriod === 'current' ? 'Actual' : selectedPeriod === 'last_month' ? 'Último mes' : selectedPeriod === 'last_quarter' ? 'Último trimestre' : 'Último año'}`}
            {selectedCarrera !== 'all' &&
              ` Carrera: ${selectedCarrera === '1' ? 'Análisis Funcional' : selectedCarrera === '2' ? 'Desarrollo de Software' : 'Infraestructura de TI'}`}
            <button
              onClick={() => {
                setSelectedPeriod('all');
                setSelectedCarrera('all');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#1976d2',
                textDecoration: 'underline',
                cursor: 'pointer',
                marginLeft: '10px'
              }}
            >
              Limpiar filtros
            </button>
          </div>
        )}
      </div>

      {/* Métricas principales */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Inscripciones"
          value={stats.inscripciones.total || 0}
          icon="📝"
          color="blue"
          subtitle="Este período"
          trend={stats.inscripciones.trend}
        />

        <StatCard
          title="Alumnos Activos"
          value={stats.alumnos.activos || 0}
          icon="👥"
          color="green"
          subtitle="Cursando actualmente"
          trend={stats.alumnos.trend}
        />

        <StatCard
          title="Tasa de Aprobación"
          value={`${stats.academico.aprobacion || 0}%`}
          icon="🎓"
          color="purple"
          subtitle="Promedio general"
          trend={stats.academico.trend}
        />

        <StatCard
          title="Encuestas Completadas"
          value={`${stats.encuestas.completadas || 0}%`}
          icon="📋"
          color="orange"
          subtitle="Tasa de respuesta"
          trend={stats.encuestas.trend}
        />
      </div>

      {/* Gráficos y detalles */}
      <div className={styles.chartsGrid}>
        <ChartCard title="📈 Inscripciones por Mes">
          <div className={styles.barChart}>
            {stats.inscripciones.porMes &&
              Object.entries(stats.inscripciones.porMes).map(([mes, cantidad]) => (
                <div key={mes} className={styles.barItem}>
                  <div
                    className={styles.bar}
                    style={{
                      height: `${(cantidad / Math.max(...Object.values(stats.inscripciones.porMes))) * 100}%`
                    }}
                  ></div>
                  <span className={styles.barLabel}>{mes}</span>
                  <span className={styles.barValue}>{cantidad}</span>
                </div>
              ))}
          </div>
        </ChartCard>

        <ChartCard title="🎯 Distribución por Carrera">
          <div className={styles.pieChart}>
            {stats.alumnos.porCarrera &&
              Object.entries(stats.alumnos.porCarrera).map(([carrera, data]) => (
                <div key={carrera} className={styles.pieItem}>
                  <div className={styles.pieColor} style={{ backgroundColor: data.color }}></div>
                  <span className={styles.pieLabel}>{data.nombre}</span>
                  <span className={styles.pieValue}>
                    {data.cantidad} ({data.porcentaje}%)
                  </span>
                </div>
              ))}
          </div>
        </ChartCard>

        <ChartCard title="📊 Rendimiento por UC">
          <div className={styles.performanceList}>
            {stats.academico.porUC &&
              stats.academico.porUC.slice(0, 5).map((uc, index) => (
                <div key={uc.id} className={styles.performanceItem}>
                  <span className={styles.performanceRank}>#{index + 1}</span>
                  <span className={styles.performanceName}>{uc.nombre}</span>
                  <div className={styles.performanceBar}>
                    <div
                      className={styles.performanceFill}
                      style={{ width: `${uc.aprobacion}%` }}
                    ></div>
                  </div>
                  <span className={styles.performanceValue}>{uc.aprobacion}%</span>
                </div>
              ))}
          </div>
        </ChartCard>

        <ChartCard title="💬 Actividad del Sistema">
          <div className={styles.activityList}>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>📧</span>
              <span className={styles.activityLabel}>Comunicaciones enviadas</span>
              <span className={styles.activityValue}>{stats.sistema.comunicaciones || 0}</span>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>❓</span>
              <span className={styles.activityLabel}>Solicitudes procesadas</span>
              <span className={styles.activityValue}>{stats.sistema.solicitudes || 0}</span>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>📋</span>
              <span className={styles.activityLabel}>Encuestas activas</span>
              <span className={styles.activityValue}>{stats.sistema.encuestasActivas || 0}</span>
            </div>
            <div className={styles.activityItem}>
              <span className={styles.activityIcon}>⏱️</span>
              <span className={styles.activityLabel}>Tiempo resp. promedio</span>
              <span className={styles.activityValue}>{stats.sistema.tiempoRespuesta || 0}h</span>
            </div>
          </div>
        </ChartCard>
      </div>

      {/* Resumen ejecutivo */}
      <div className={styles.summaryCard}>
        <h3>📋 Resumen Ejecutivo</h3>
        <div className={styles.summaryContent}>
          <p>
            <strong>Período analizado:</strong>{' '}
            {selectedPeriod === 'all'
              ? 'Todos los períodos'
              : selectedPeriod === 'current'
                ? 'Período actual'
                : selectedPeriod === 'last_month'
                  ? 'Último mes'
                  : selectedPeriod === 'last_quarter'
                    ? 'Último trimestre'
                    : selectedPeriod === 'last_year'
                      ? 'Último año'
                      : selectedPeriod}
          </p>
          <p>
            <strong>Carrera:</strong>{' '}
            {selectedCarrera === 'all'
              ? 'Todas las carreras'
              : selectedCarrera === '1'
                ? 'Análisis Funcional'
                : selectedCarrera === '2'
                  ? 'Desarrollo de Software'
                  : selectedCarrera === '3'
                    ? 'Infraestructura de TI'
                    : 'Carrera seleccionada'}
          </p>
          <p>
            <strong>Última actualización:</strong>{' '}
            {new Date().toLocaleString('es-ES', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
          <p>
            <strong>Observaciones:</strong>{' '}
            {stats.resumen?.observaciones ||
              'El sistema está funcionando correctamente con métricas dentro de los rangos esperados.'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Estadisticas;
