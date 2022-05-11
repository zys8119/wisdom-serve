import {AppServe, Plugin} from "@wisdom-serve/serve/types/type";
import {IncomingMessage, ServerResponse} from "http";
import {createPool, FieldInfo, MysqlError, Pool, QueryOptions} from "mysql";
import {sync} from "fast-glob";
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

export class $DBModel {
    tables = {}
    constructor(app:AppServe, request:IncomingMessage, response:ServerResponse) {
        console.log(sync("DB/*.ts",{cwd:process.cwd()}))
        return
    }
}

const mysql:Plugin = function (request, response){
    return new Promise<void>(resolve => {
        this.$DB = new DBSql(this, request, response);
        this.$DBModel = new $DBModel(this, request, response);
        resolve()
    })
}
export default mysql

export interface DBModel {
    commit?:string // 注释
    collate?:'utf8_unicode_ci'  // 编码
    character?:'utf8' // 字符集
    columns:DBModel_columns// 表栏目
}

export type DBModel_columns = {
    [columnName:string]:Partial<DBModel_columns_config>
}

export type DBModel_columns_config = {
    varchar:number
    ch:number
}

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        $DB:DBSql
        $DBModel:$DBModel
    }
}
