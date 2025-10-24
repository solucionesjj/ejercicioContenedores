const { pool } = require('../config/database');

// Listar actividades con paginación y filtros
const getActivities = async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    // Sanitización y coerción numérica segura
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 10));
    const offsetNum = (pageNum - 1) * limitNum;

    let query = 'SELECT id, activity, status, insertDate, lastUpdateDate FROM Activities';
    let countQuery = 'SELECT COUNT(*) as total FROM Activities';
    let queryParams = [];
    let countParams = [];

    // Aplicar filtro por estado si se proporciona y no es "all"
    if (status && status !== 'all') {
      query += ' WHERE status = ?';
      countQuery += ' WHERE status = ?';
      queryParams.push(status);
      countParams.push(status);
    }

    // Ordenar y paginar
    // Nota: Algunos servidores MySQL pueden dar problemas con placeholders en LIMIT/OFFSET.
    // Como mitigación, los integramos tras sanitizar a enteros.
    query += ` ORDER BY insertDate DESC LIMIT ${limitNum} OFFSET ${offsetNum}`;

    // Ejecutar consultas
    const [activities] = await pool.execute(query, queryParams);
    const [countResult] = await pool.execute(countQuery, countParams);
    
    const total = countResult[0].total;
    const totalPages = Math.ceil(total / limitNum);

    res.json({
      success: true,
      data: activities,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1
      }
    });

  } catch (error) {
    console.error('Error obteniendo actividades:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Crear nueva actividad
const createActivity = async (req, res) => {
  try {
    const { activity, status = 'To do' } = req.body;

    // Validar campo requerido
    if (!activity || activity.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'La descripción de la actividad es requerida'
      });
    }

    // Validar estado
    const validStatuses = ['To do', 'Doing', 'Done'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser: To do, Doing o Done'
      });
    }

    // Insertar nueva actividad
    const [result] = await pool.execute(
      'INSERT INTO Activities (activity, status) VALUES (?, ?)',
      [activity.trim(), status]
    );

    // Obtener la actividad creada
    const [newActivity] = await pool.execute(
      'SELECT id, activity, status, insertDate, lastUpdateDate FROM Activities WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      message: 'Actividad creada exitosamente',
      data: newActivity[0]
    });

  } catch (error) {
    console.error('Error creando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Actualizar actividad
const updateActivity = async (req, res) => {
  try {
    const { id } = req.params;
    const { activity, status } = req.body;

    // Validar que al menos un campo esté presente
    if (!activity && !status) {
      return res.status(400).json({
        success: false,
        message: 'Debe proporcionar al menos la descripción o el estado para actualizar'
      });
    }

    // Verificar que la actividad existe
    const [existingActivity] = await pool.execute(
      'SELECT id FROM Activities WHERE id = ?',
      [id]
    );

    if (existingActivity.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Construir query de actualización dinámicamente
    let updateFields = [];
    let updateValues = [];

    if (activity !== undefined) {
      if (activity.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'La descripción de la actividad no puede estar vacía'
        });
      }
      updateFields.push('activity = ?');
      updateValues.push(activity.trim());
    }

    if (status !== undefined) {
      const validStatuses = ['To do', 'Doing', 'Done'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Estado inválido. Debe ser: To do, Doing o Done'
        });
      }
      updateFields.push('status = ?');
      updateValues.push(status);
    }

    updateValues.push(id);

    // Ejecutar actualización
    await pool.execute(
      `UPDATE Activities SET ${updateFields.join(', ')} WHERE id = ?`,
      updateValues
    );

    // Obtener la actividad actualizada
    const [updatedActivity] = await pool.execute(
      'SELECT id, activity, status, insertDate, lastUpdateDate FROM Activities WHERE id = ?',
      [id]
    );

    res.json({
      success: true,
      message: 'Actividad actualizada exitosamente',
      data: updatedActivity[0]
    });

  } catch (error) {
    console.error('Error actualizando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Eliminar actividad
const deleteActivity = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la actividad existe
    const [existingActivity] = await pool.execute(
      'SELECT id FROM Activities WHERE id = ?',
      [id]
    );

    if (existingActivity.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Actividad no encontrada'
      });
    }

    // Eliminar actividad
    await pool.execute('DELETE FROM Activities WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Actividad eliminada exitosamente'
    });

  } catch (error) {
    console.error('Error eliminando actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

module.exports = {
  getActivities,
  createActivity,
  updateActivity,
  deleteActivity
};