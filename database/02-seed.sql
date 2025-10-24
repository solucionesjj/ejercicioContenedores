-- Datos de prueba para la aplicación ToDo
USE ToDo;

-- Insertar usuarios de prueba
-- Contraseña para ambos usuarios: "password123" (hasheada con bcrypt)
INSERT INTO User (email, password, name) VALUES 
('admin@todoapp.com', '$2b$10$VWwAcaN4zJGdfBDEZqVuheEd2TVoaIgm18YCWL6qCxFFd3QSeWnee', 'Administrador'),
('usuario@test.com', '$2b$10$VWwAcaN4zJGdfBDEZqVuheEd2TVoaIgm18YCWL6qCxFFd3QSeWnee', 'Usuario de Prueba'),
('demo@example.com', '$2b$10$VWwAcaN4zJGdfBDEZqVuheEd2TVoaIgm18YCWL6qCxFFd3QSeWnee', 'Usuario Demo')
ON DUPLICATE KEY UPDATE name = VALUES(name);

-- Insertar actividades de ejemplo
INSERT INTO Activities (activity, status) VALUES 
('Completar documentación del proyecto', 'To do'),
('Revisar código del frontend', 'Doing'),
('Implementar autenticación JWT', 'Done'),
('Crear tests unitarios', 'To do'),
('Optimizar consultas de base de datos', 'Doing'),
('Configurar Docker containers', 'Done'),
('Implementar paginación en el frontend', 'To do'),
('Añadir validaciones de formularios', 'Doing'),
('Crear sistema de notificaciones', 'To do'),
('Mejorar diseño responsive', 'Done'),
('Implementar filtros por estado', 'Done'),
('Configurar CI/CD pipeline', 'To do'),
('Realizar pruebas de integración', 'Doing'),
('Documentar API endpoints', 'To do'),
('Optimizar rendimiento del frontend', 'To do');