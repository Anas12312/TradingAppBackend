import { Request, Response } from "express";
import tickersServices from "../services/tickersServices";

async function getAll(req: Request, res: Response) {
    try {
        const tickers = await tickersServices.getAll()
        res.send(tickers)
    }
    catch (e) {
        console.log(e);
        res.status(500).send(e)
    }
}
async function dismiss(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.dismissCheck(ticker)
    res.send({
        message: "done"
    })
}
async function activeTicker(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.activeTicker(ticker)
    res.send({
        message: "done"
    })
}
async function activateAlerts(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.activateAlerts(ticker)
    res.send({
        message: "done"
    })
}
async function deactivateAlerts(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.deactivateAlerts(ticker)
    res.send({
        message: "done"
    })
}
async function intrade(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.intrade(ticker)
    res.send({
        message: "done"
    })
}
async function detrade(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.detrade(ticker)
    res.send({
        message: "done"
    })
}
async function notify(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.notify(ticker)
    res.send({
        message: "done"
    })
}
async function unotify(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.unotify(ticker)
    res.send({
        message: "done"
    })
}
async function notifyAll(req: Request, res: Response) {
    const results = await tickersServices.notifyAll()
    res.send({
        message: "done"
    })
}
async function unotifyAll(req: Request, res: Response) {
    const results = await tickersServices.unotifyAll()
    res.send({
        message: "done"
    })
}
async function remove(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.remove(ticker)
    res.send({
        message: "done"
    })
}
export default {
    getAll,
    dismiss,
    remove,
    activateAlerts,
    deactivateAlerts,
    intrade,
    detrade,
    activeTicker,
    notify,
    unotify,
    notifyAll,
    unotifyAll
}