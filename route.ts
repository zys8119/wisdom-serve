import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/api",
            controller(){
                return Promise.reject()
            },
            children:[
                {
                    path:"getData",
                    controller(){
                        console.log(this.$query)
                    },
                }
            ]
        },
    ]
});
