import { Request, Response } from 'express'
import usersServices from '../services/usersServices'

async function login(req: Request, res: Response) {
    const username = req.body.username
    const password = req.body.password
    console.log(username + password)
    if(!username || !password) return res.status(400).send()
    try {
        await usersServices.login(username, password)
        return res.status(200).send()
    } catch(e) {
        return res.status(401).send()
    }
}

export default {
    login
}