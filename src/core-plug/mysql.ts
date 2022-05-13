import {AppServe, Plugin} from "@wisdom-serve/serve/types/type";
import {IncomingMessage, ServerResponse} from "http";
import {createPool, FieldInfo, MysqlError, Pool, QueryOptions} from "mysql";
import {sync} from "fast-glob";
import * as ncol from "ncol"
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
    tables:$DBModelTables = {}
    constructor(app:AppServe, request:IncomingMessage, response:ServerResponse) {
        sync("DB/*.ts",{cwd:process.cwd(), absolute:true}).forEach(e=> {
            const ctx = require(e)
            for(const k in ctx){
                if(Object.prototype.toString.call(ctx[k]) === '[object Function]' && !ctx[k].$$is__rewrite && ctx[k].name !== '$$is__rewrite'){
                    const ctxFn = ctx[k];
                    ctx[k] =  function $$is__rewrite(...args){
                        try {
                            return ctxFn({ctx, app, request, response}, ...args)
                        }catch (err) {
                            if(err){
                                ncol.error('mysql plug', err)
                            }
                            response.writeHead(500,{"Content-Type": "text/plain; charset=utf-8"})
                            response.end("服务器内部错误！")
                        }
                    }
                    ctx[k].$$is__rewrite = true;
                }
            }
            const info = {
                ctx,
                path:e,
                name:((e.match(/([^/\\]*)\.ts$/) || [])[1] || "")
            }
            this.tables[info.name] = info
        })
        return
    }
}

export const def = (fn:(options?:{
    ctx:$DBModelTablesCtx,
    app:AppServe,
    request:IncomingMessage,
    response:ServerResponse,
}, ...args:any[])=>any)=> {
    return fn
}

const mysql:Plugin = function (request, response){
    return new Promise<void>(resolve => {
        this.$DB = new DBSql(this, request, response);
        this.$DBModel = new $DBModel(this, request, response);
        resolve()
    })
}

export default mysql


export interface $DBModelTables {
    [key:string]: {
        name:string
        path:string
        ctx:$DBModelTablesCtx
    }
}

export type $DBModelTablesCtx = {
    [key:string]:any
    default:DBModel
}

export interface DBModel {
    commit?:string // 注释
    collate?:'utf8_unicode_ci' | string  // 编码
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
