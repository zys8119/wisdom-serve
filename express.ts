import {Controller} from "@wisdom-serve/serve";
import * as express from "express";
const app = express()
const router =express.Router()
app.use(router)

router.use("/:name", (req,res,next) => {
    res.send("asdasdasdasd544544a")
    next()
})
export default (async function (req, res){
    app(req, res)
    app.init()
    return Promise.reject(false)
}) as Controller
