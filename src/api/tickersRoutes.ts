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
tickersRoutes.post('/notify/:ticker', tickersController.notify)
tickersRoutes.post('/unotify/:ticker', tickersController.unotify)
tickersRoutes.post('/notify-all', tickersController.notifyAll)
tickersRoutes.post('/unotify-all', tickersController.unotifyAll)
tickersRoutes.delete('/:ticker', tickersController.remove)

export default tickersRoutes