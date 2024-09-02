import { Request, Response } from "express";
import tickersServices from "../services/tickersServices";

async function getAll(req: Request, res: Response) {
    const tickers = await tickersServices.getAll()
    // console.log(tickers)
    res.send(tickers)
}
async function toggleCheck(req: Request, res: Response) {
    const ticker = req.params.ticker
    const results = await tickersServices.toggleCheck(ticker)
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
    toggleCheck,
    remove
}