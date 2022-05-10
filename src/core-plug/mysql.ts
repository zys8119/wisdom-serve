import {AppServe, Plugin} from "@wisdom-serve/serve/types/type";
import {IncomingMessage, ServerResponse} from "http";
import {createPool, FieldInfo, MysqlError, Pool, QueryOptions} from "mysql";
export class DBSql{
    private connection:Pool
    constructor(app:AppServe, request:IncomingMessage, response:ServerResponse) {
        this.connection = createPool(app.options.mysqlConfig)
    }

    query(options: string | QueryOptions, values?: any):Promise<Partial<{
        results:any
        err:MysqlError
        fields:FieldInfo[]
    }>>{
        return new Promise((resolve, reject) => {
            this.connection.query(options, values, (err, results, fields)=>{
                if(err){
                    reject({err})
                }else {
                    resolve({results, fields})
                }
            })
        })
    }
}

const mysql:Plugin = function (request, response){
    return new Promise<void>(resolve => {
        this.$DB = new DBSql(this, request, response);
        resolve()
    })
}
export default mysql

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        $DB:DBSql
    }
}
