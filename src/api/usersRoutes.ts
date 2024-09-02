import { Router } from "express";
import usersController from '../controllers/usersController'

const usersRoutes = Router()

usersRoutes.post('/login', usersController.login)

export default usersRoutes