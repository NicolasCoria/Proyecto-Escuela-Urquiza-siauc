import React from 'react';
import styles from './profile.module.css';
import { useStateContext } from '../../../Components/Contexts';
import {
  FaUser,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaCalendarAlt,
  FaIdCard
} from 'react-icons/fa';

const AdminProfile = () => {
  const { user } = useStateContext();

  // Si no hay usuario logueado, mostrar mensaje
  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.errorMessage}>No hay datos de usuario disponibles.</div>
      </div>
    );
  }

  // Función para formatear fecha
  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Mi Perfil de Administrador</h1>
        <p>Información personal y de contacto</p>
      </div>

      <div className={styles.profileCard}>
        {/* Foto de perfil */}
        <div className={styles.photoSection}>
          <div className={styles.photoContainer}>
            <img
              src="/assets/images/defaultProfile.png"
              alt="Foto de perfil"
              className={styles.profilePhoto}
            />
          </div>
          <div className={styles.roleBadge}>
            <FaUser className={styles.roleIcon} />
            <span>Administrador</span>
          </div>
        </div>

        {/* Información personal */}
        <div className={styles.infoSection}>
          <div className={styles.sectionTitle}>
            <h2>Información Personal</h2>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaUser className={styles.infoIcon} />
                <span>Nombre Completo</span>
              </div>
              <div className={styles.infoValue}>
                {user.nombre} {user.apellido}
              </div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaIdCard className={styles.infoIcon} />
                <span>DNI</span>
              </div>
              <div className={styles.infoValue}>{user.DNI || 'No especificado'}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaCalendarAlt className={styles.infoIcon} />
                <span>Fecha de Nacimiento</span>
              </div>
              <div className={styles.infoValue}>{formatDate(user.fecha_nac)}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaUser className={styles.infoIcon} />
                <span>Género</span>
              </div>
              <div className={styles.infoValue}>{user.genero || 'No especificado'}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <span>Nacionalidad</span>
              </div>
              <div className={styles.infoValue}>{user.nacionalidad || 'No especificada'}</div>
            </div>
          </div>
        </div>

        {/* Información de contacto */}
        <div className={styles.infoSection}>
          <div className={styles.sectionTitle}>
            <h2>Información de Contacto</h2>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaEnvelope className={styles.infoIcon} />
                <span>Correo Electrónico</span>
              </div>
              <div className={styles.infoValue}>{user.email}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaPhone className={styles.infoIcon} />
                <span>Teléfono</span>
              </div>
              <div className={styles.infoValue}>{user.telefono || 'No especificado'}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaMapMarkerAlt className={styles.infoIcon} />
                <span>Dirección</span>
              </div>
              <div className={styles.infoValue}>{user.direccion || 'No especificada'}</div>
            </div>
          </div>
        </div>

        {/* Información del sistema */}
        <div className={styles.infoSection}>
          <div className={styles.sectionTitle}>
            <h2>Información del Sistema</h2>
          </div>

          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaUser className={styles.infoIcon} />
                <span>ID de Usuario</span>
              </div>
              <div className={styles.infoValue}>{user.id_admin}</div>
            </div>

            <div className={styles.infoItem}>
              <div className={styles.infoLabel}>
                <FaEnvelope className={styles.infoIcon} />
                <span>Dominio de Email</span>
              </div>
              <div className={styles.infoValue}>@terciariourquiza.edu.ar</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;
