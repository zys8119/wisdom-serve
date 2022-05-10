import {createRoute} from "@wisdom-serve/serve"
export default createRoute({
    routes:[
        {
            path:"/",
            method:["post", "get"],
            controller:async function (r){
                const res = await this.$DB.query(`SELECT TABLE_NAME from information_schema.TABLES where TABLE_SCHEMA = "unity_front_utils_admin"`)
                const res2 = await this.$DB.query(`SELECT * from unity_front_utils_admin.luckydraw`)
                console.log(res.fields, res2.fields)
                this.$success()
            }
        },
    ]
});
