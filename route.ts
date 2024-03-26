import {createRoute} from "@wisdom-serve/serve"
import {readFileSync} from "fs";
import {resolve} from "path";
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                this.$send(readFileSync(resolve(__dirname, './views/welcome.html')))
            },
        },
        {
            path:"/saas/api/v1/captcha",
            controller:async ()=> import("./application/captcha")
        },
        {
            path:"/saas/api/v1/captcha/:id",
            controller:async ()=> import("./application/captcha")
        },
        {
            path:"/saas/api/v1/auth/login",
            funName:"login",
            method:"post",
            controller:async ()=> import("./application/auth")
        },
        {
            path:"/saas/api/v1/",
            funName:"interceptor",
            name:"user",
            controller:async ()=> import("./application/auth"),
            children:[
                {
                    path:'menu/get_menus_by_user/:userId',
                    controller:async function(req, res, resultMaps){
                        console.log(3333, resultMaps.user)
                        this.$success("asda")
                    }
                }
            ]
        }
    ]
});
