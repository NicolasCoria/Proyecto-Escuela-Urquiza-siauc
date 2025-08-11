-- SQL para crear las tablas de mensajes del sistema de comunicaciones internas
-- Ejecutar estos comandos en el gestor de base de datos MySQL

-- Tabla de mensajes
CREATE TABLE mensajes (
    id_mensaje BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(200) NOT NULL,
    contenido TEXT NOT NULL,
    prioridad ENUM('baja', 'media', 'alta', 'urgente') DEFAULT 'media',
    id_admin_creador BIGINT UNSIGNED NOT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_admin_creador) REFERENCES administrador(id_admin) ON DELETE CASCADE
);

-- Tabla de destinatarios de mensajes
CREATE TABLE destinatarios_mensaje (
    id_destinatario BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_mensaje BIGINT UNSIGNED NOT NULL,
    id_alumno BIGINT UNSIGNED NOT NULL,
    leido BOOLEAN DEFAULT FALSE,
    fecha_lectura TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP NULL DEFAULT NULL,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    FOREIGN KEY (id_mensaje) REFERENCES mensajes(id_mensaje) ON DELETE CASCADE,
    FOREIGN KEY (id_alumno) REFERENCES alumno(id_alumno) ON DELETE CASCADE,
    UNIQUE KEY unique_mensaje_alumno (id_mensaje, id_alumno)
);

-- Índices para mejorar el rendimiento
CREATE INDEX idx_mensajes_admin_creador ON mensajes(id_admin_creador);
CREATE INDEX idx_mensajes_created_at ON mensajes(created_at);
CREATE INDEX idx_destinatarios_mensaje_leido ON destinatarios_mensaje(leido);
CREATE INDEX idx_destinatarios_mensaje_alumno ON destinatarios_mensaje(id_alumno);