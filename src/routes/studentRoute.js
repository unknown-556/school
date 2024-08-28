import express from 'express'

import { signIn, profile } from '../controllers/studentLogin.js'
import student from '../middlewares/auth.js'

const router = express.Router()

router.post("/login", signIn)
router.get("/profile", student, profile)

export default router