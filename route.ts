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
            path:"/chat_test",
            funName:"chat_test",
            controller:()=> import("./chat"),
        },{
            path:"/api",
            funName:'chatAuthInterceptor',
            name:"userInfo",
            controller:()=> import("./chat"),
            children:[
                {
                    path:'v1',
                    children:[
                        {
                            path:"chat",
                            funName:"chat",
                            controller:()=> import("./chat")
                        },
                        {
                            path:"getChatToken",
                            funName:"getChatToken",
                            controller:()=> import("./chat")
                        },
                        {
                            path:"pdf-parse",
                            funName:"pdfParse",
                            controller:()=> import("./chat")
                        },
                        {
                            path:"history",
                            funName:"history",
                            controller:()=> import("./chat")
                        },
                        {
                            path:"createHistory",
                            funName:"createHistory",
                            controller:()=> import("./chat")
                        },
                        {
                            path:"getChatHistory",
                            funName:"getChatHistory",
                            controller:()=> import("./chat")
                        }
                    ]
                }
            ]
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
    ]
});
