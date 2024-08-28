import express from 'express'

import { signIn, signUp, logout } from '../controllers/authControllers.js'

const router = express.Router()

router.post("/signup", signUp)

router.post("/login", signIn)

router.post("/logout", logout)

export default router