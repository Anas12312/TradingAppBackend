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
    intrade
}