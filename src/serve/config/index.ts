import {AppServeOptions} from "../types/type";
import { PoolConfig} from "mysql";

export default <Partial<AppServeOptions>>{
    serve:{
        port:81,
        LogServeInfo:true
    },
    mysqlConfig:<PoolConfig>{
        connectionLimit : 10,
        host: 'localhost',
        user: 'root',
        password: 'rootroot',
        port: 3306,
        database:"unity_front_utils_admin",
        prefix:""
    }
}
