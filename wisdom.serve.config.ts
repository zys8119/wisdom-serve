import {AppServeOptions} from "@wisdom-serve/serve/types/type";

export default <Partial<AppServeOptions>>{
    mysqlAuto:false,
    debug:true,
    query_params:true,
    serve:{
        port:82
    },
    mysqlConfig:{
        connectionLimit : 100,
        host: '192.168.110.242',
        user: 'root',
        password: 'Ul6WI12AuZomj76Kvl700-',
        port: 3306,
        prefix:"",
        database:"conference"
    },
    extMysqlConfig:{
        chat:{
            connectionLimit : 100,
            host: '127.0.0.1',
            user: 'root',
            password: 'rootroot',
            port: 3306,
            prefix:"",
            database:"chat"
        },
        designForm:{
            connectionLimit : 100,
            host: '127.0.0.1',
            user: 'root',
            password: 'rootroot',
            port: 3306,
            prefix:"",
            database:"design_form"
        }
    },
    cors:true
}
