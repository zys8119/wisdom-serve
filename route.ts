import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                this.$success('Welcome to RAG')
            },
        },
        {
            path:"/zentao",
            funName:'zentao',
            controller:()=> import("./zentao")
        },
        {
            path:"/zentao-login",
            funName:'zentaoLogin',
            controller:()=> import("./zentao")
        },
        {
            path:"/puppeteer",
            funName:'puppeteer',
            controller:()=> import("./puppeteer")
        },
        {
            path:"/design-from",
            children:[
                {
                    path:"v1",
                    children:[
                        {
                            path:"list",
                            funName:'list',
                            controller:()=> import("./design-from")
                        },
                        {
                            path:"addForm",
                            funName:'addForm',
                            controller:()=> import("./design-from")
                        },
                        {
                            path:"updateForm",
                            funName:'updateForm',
                            controller:()=> import("./design-from")
                        }
                    ]
                }
            ]
        }
    ]
});
