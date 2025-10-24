const express = require('express');
const { 
  getActivities, 
  createActivity, 
  updateActivity, 
  deleteActivity 
} = require('../controllers/activitiesController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Aplicar middleware de autenticación a todas las rutas
router.use(authenticateToken);

// GET /api/activities - Listar actividades con paginación y filtros
router.get('/', getActivities);

// POST /api/activities - Crear nueva actividad
router.post('/', createActivity);

// PUT /api/activities/:id - Actualizar actividad
router.put('/:id', updateActivity);

// DELETE /api/activities/:id - Eliminar actividad
router.delete('/:id', deleteActivity);

module.exports = router;