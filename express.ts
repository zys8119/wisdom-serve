import {Controller} from "@wisdom-serve/serve";
import * as express from "express";

const app = express()
const router = express.Router()
app
.use("/express", router)
router.use(/^\/$/, async (req, res, next)=>{
    res.send('111')
    next()
})
router.use('/asd', async (req, res, next)=>{
    res.send('asda')
    next()
})
export default (async function (req, res){
    app(req, res)
}) as Controller
