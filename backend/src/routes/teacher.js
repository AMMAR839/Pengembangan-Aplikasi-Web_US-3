const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roles');
const {
  createTeacher,
  listTeachers,
  getTeacherById,
  updateTeacher,
  deleteTeacher,
  searchTeachers
} = require('../controllers/teacherController');

// All endpoints require authentication and admin role
router.use(auth, requireRole('admin'));

// CRUD operations
router.post('/', createTeacher);
router.get('/', listTeachers);
router.get('/search', searchTeachers);
router.get('/:id', getTeacherById);
router.patch('/:id', updateTeacher);
router.delete('/:id', deleteTeacher);

module.exports = router;
