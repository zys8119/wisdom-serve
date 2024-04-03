import {AppServeOptions} from "@wisdom-serve/serve/types/type";
export default <Partial<AppServeOptions>>{
    mysqlAuto:/^\/mysqlAuto$/,
    debug:true,
    query_params:true,
    cors:true,
    mysqlConfig:{
        connectionLimit : process.env.MYSQL_CONNECTIONLIMIT || 100,
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || 'Zj21947..',
        port: process.env.MYSQL_PORT || 3306,
        database:process.env.MYSQL_DATABASE || "basicPermissions",
        prefix:process.env.MYSQL_PREFIX || ""
    },
    token:{
        secret:"asasda",
        expiresIn:1000*60*60*24
    }
}
