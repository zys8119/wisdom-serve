import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/api",
            children:[
                {
                    path:"getData",
                    controller:(req, res)=>{
                        res.end("asdasd")
                    },
                }
            ]
        },
    ]
});
