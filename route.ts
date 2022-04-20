import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/api",
            children:[
                {
                    path:"getData",
                    controller(res,response){
                        response.writeHead(500,{"Content-Type": "text/plain; charset=utf-8"})
                        response.end("asdasda！")
                        console.log(this.$query)
                    },
                }
            ]
        },
    ]
});
