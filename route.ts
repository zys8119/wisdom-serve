import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                this.$success('Welcome to RAG')
            },
        },{
            path:"/api",
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
                            path:"pdf-parse",
                            funName:"pdfParse",
                            controller:()=> import("./chat")
                        },
                        {
                            path:"history",
                            funName:"history",
                            controller:()=> import("./chat")
                        }
                    ]
                }
            ]
        }
    ]
});
