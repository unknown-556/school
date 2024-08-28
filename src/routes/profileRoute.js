import express from 'express'

import { addStudent, addResult, getProfiles, getClass, profile, getClassProfiles, updateStudentClass, assignClass, updateClassForAllProfiles } from '../controllers/profileController.js'
import auth from '../middlewares/auth.js'
import { checkAdminRole } from '../middlewares/admin.js'
import { checkUserClass } from '../middlewares/role.js'

const router = express.Router()

router.post('/add', auth, addStudent)
router.get('/', checkAdminRole('admin'), getProfiles)
router.get('/class', checkAdminRole('admin'), getClass)
router.get('/student/:id', auth,  profile)
router.put('/result', auth, checkUserClass, addResult)
router.get('/myclass', auth, checkUserClass, getClassProfiles)
router.patch('/nextclass', checkAdminRole('admin'), updateStudentClass)
router.patch('/newTeacher', checkAdminRole('admin'), assignClass)
router.patch('/newclass', checkAdminRole('admin'), updateClassForAllProfiles)


export default router