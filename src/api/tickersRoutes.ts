import { Router } from "express";
import tickersController from "../controllers/tickersController";

const tickersRoutes = Router()

tickersRoutes.get('/', tickersController.getAll)
tickersRoutes.post('/check/:ticker', tickersController.toggleCheck)
tickersRoutes.delete('/:ticker', tickersController.remove)

export default tickersRoutes