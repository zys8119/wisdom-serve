import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            controller:async function (){
                // this.$success()
            },
            children:[
                {
                    path:"api/:aaa/:bbb",
                    controller:async function(req, res){
                        this.$success()
                    }
                },
                {
                    path:"express/.*/:b",
                    // strict:false,
                    controller:async function(req, res){
                        console.log(this.$params)
                        this.$success({s:44555})
                    }
                }
            ]
        }
    ]
});
