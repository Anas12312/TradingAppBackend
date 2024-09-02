import express, { json } from "express";
import tickersRoutes from "./api/tickersRoutes";
import cors from 'cors'
import dotenv from 'dotenv'
dotenv.config()
// console.log('ENV:' + process.env.AWS_ACCESS_KEY_ID);

const app = express();
const port = process.env.PORT || 3000;

// JSON Parser Middleware
app.use(json());
app.use(cors())
app.use('/tickers', tickersRoutes)

app.listen(port, () => {
    console.log('Server listening on port: ' + port);
})