-- 🚀 Optimización de Índices para Mejorar Rendimiento
-- Ejecutar estos comandos en MySQL para optimizar las consultas lentas

-- Índices para la tabla alumno_carrera
CREATE INDEX idx_alumno_carrera_alumno ON alumno_carrera(id_alumno);
CREATE INDEX idx_alumno_carrera_carrera ON alumno_carrera(id_carrera);
CREATE INDEX idx_alumno_carrera_composite ON alumno_carrera(id_alumno, id_carrera);

-- Índices para la tabla alumno_grado
CREATE INDEX idx_alumno_grado_alumno ON alumno_grado(id_alumno);
CREATE INDEX idx_alumno_grado_grado ON alumno_grado(id_grado);
CREATE INDEX idx_alumno_grado_composite ON alumno_grado(id_alumno, id_grado);

-- Índices para la tabla alumno_uc
CREATE INDEX idx_alumno_uc_alumno ON alumno_uc(id_alumno);
CREATE INDEX idx_alumno_uc_uc ON alumno_uc(id_uc);
CREATE INDEX idx_alumno_uc_composite ON alumno_uc(id_alumno, id_uc);

-- Índices para la tabla grupos_destinatarios
CREATE INDEX idx_grupos_destinatarios_activo ON grupos_destinatarios(activo);
CREATE INDEX idx_grupos_destinatarios_admin ON grupos_destinatarios(id_admin);

-- Índices para la tabla grupo_destinatario_alumno
CREATE INDEX idx_grupo_destinatario_alumno_grupo ON grupo_destinatario_alumno(id_grupo);
CREATE INDEX idx_grupo_destinatario_alumno_alumno ON grupo_destinatario_alumno(id_alumno);
CREATE INDEX idx_grupo_destinatario_alumno_composite ON grupo_destinatario_alumno(id_grupo, id_alumno);

-- Índices para tablas principales
CREATE INDEX idx_alumno_email ON alumno(email);
CREATE INDEX idx_carrera_nombre ON carrera(carrera);
CREATE INDEX idx_grado_composite ON grado(grado, division);
CREATE INDEX idx_unidad_curricular_nombre ON unidad_curricular(unidad_curricular);

-- Verificar índices existentes
SHOW INDEX FROM alumno_carrera;
SHOW INDEX FROM alumno_grado;
SHOW INDEX FROM alumno_uc;
SHOW INDEX FROM grupos_destinatarios;
SHOW INDEX FROM grupo_destinatario_alumno;