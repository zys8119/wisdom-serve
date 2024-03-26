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
            path:"/file/api/v1/file/upload",
            funName:"upload",
            method:"post",
            controller:async ()=> import("./application/file")
        },
        {
            path:"/saas/api/v1/",
            funName:"interceptor",
            name:"user",
            controller:async ()=> import("./application/auth"),
            children:[
                {
                    path:'menu/get_menus_by_user/:userId',
                    funName:"get_menus_by_user",
                    controller:async ()=> import("./application/user")
                },
                {
                    path:'user/list',
                    funName:"getUserList",
                    controller:async ()=> import("./application/user")
                },
                {
                    path:'user/create',
                    funName:"createUser",
                    method:"post",
                    controller:async ()=> import("./application/user")
                },
                {
                    path:'user/delete',
                    funName:"deleteUser",
                    method:"post",
                    controller:async ()=> import("./application/user")
                }
            ]
        }
    ]
});
