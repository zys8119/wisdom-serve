import {AppServeOptions} from "@wisdom-serve/serve/types/type";

export default <Partial<AppServeOptions>>{
    mysqlAuto:/^\/mysqlAuto$/,
    debug:true,
    query_params:true,
    cors:true,
    mysqlConfig:{
        connectionLimit : 100,
        host: 'localhost',
        user: 'root',
        password: 'Zj21947..',
        port: 3306,
        database:"basicPermissions",
        prefix:""
    },
    token:{
        secret:"asasda",
        expiresIn:1000*60*60*24
    }
}
