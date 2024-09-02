import { Router } from "express";
import tickersController from "../controllers/tickersController";

const tickersRoutes = Router()

tickersRoutes.get('/', tickersController.getAll)
tickersRoutes.post('/dismiss/:ticker', tickersController.dismiss)
tickersRoutes.post('/activate/:ticker', tickersController.activateAlerts)
tickersRoutes.post('/deactivate/:ticker', tickersController.deactivateAlerts)
tickersRoutes.delete('/:ticker', tickersController.remove)

export default tickersRoutes