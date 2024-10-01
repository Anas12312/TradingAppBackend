import { Router } from "express";
import tickersController from "../controllers/tickersController";

const tickersRoutes = Router()

tickersRoutes.get('/', tickersController.getAll)
tickersRoutes.post('/dismiss/:ticker', tickersController.dismiss)
tickersRoutes.post('/active/:ticker', tickersController.activeTicker)
tickersRoutes.post('/activate/:ticker', tickersController.activateAlerts)
tickersRoutes.post('/deactivate/:ticker', tickersController.deactivateAlerts)
tickersRoutes.post('/intrade/:ticker', tickersController.intrade)
tickersRoutes.post('/detrade/:ticker', tickersController.detrade)
tickersRoutes.delete('/:ticker', tickersController.remove)

export default tickersRoutes