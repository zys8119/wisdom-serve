import {AppServe, Plugin} from "@wisdom-serve/serve/types/type";
import {IncomingMessage, ServerResponse} from "http";
import {createPool, FieldInfo, MysqlError, Pool, QueryOptions} from "mysql";
import {sync} from "fast-glob";
import * as ncol from "ncol"
import {get} from "lodash"
export class DBSql{
    private app:AppServe
    private request:IncomingMessage
    private response:ServerResponse
    private connection:Pool
    constructor(app:AppServe, request:IncomingMessage, response:ServerResponse) {
        this.app = app
        this.request = request
        this.response = response
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
                    // 释放连接池
                    this.connection.getConnection(((err1, connection) => {
                        try {
                            connection.release()
                        }catch (e) {
                            //
                        }
                        resolve({results, fields})
                    }))
                }
            })
        })
    }
}


export class $Serialize {
    app:AppServe
    request:IncomingMessage
    response:ServerResponse
    constructor(app:AppServe, request:IncomingMessage, response:ServerResponse) {
        this.app = app;
        this.request = request;
        this.response = response;
    }

    /**
     * 序列化数据
     * @param data
     * @param defMap
     */
    def(data:any, defMap:{
        [key:string]:[string | ((data:any)=>any)] | [string | ((data:any)=>any), any] | boolean
    } = {}, excludeReg?:RegExp):any{
        if(Object.prototype.toString.call(data) === '[object Array]'){
            return data.map(d=>this.def(d, defMap, excludeReg))
        } else if(Object.prototype.toString.call(data) === '[object Object]'){
            for(const k in defMap){
                if(Object.prototype.toString.call(defMap[k]) === '[object Array]'){
                    if(Object.prototype.toString.call(defMap[k][0]) === '[object Function]'){
                        data[k] = get(data, (defMap[k][0] as any)(data) as string, defMap[k][1])
                    }else {
                        data[k] = get(data, defMap[k][0] as string, defMap[k][1])
                    }
                }else if(Object.prototype.toString.call(defMap[k]) === '[object Boolean]'){
                    delete data[k];
                }
            }
        }
        if(Object.prototype.toString.call(excludeReg) === '[object RegExp]'){
            for(const k in data){
                if(excludeReg.test(k)){
                   delete data[k]
                }
            }
        }
        return  data;
    }

    get(...args){
        return get.apply(get, args)
    }
}

export class $DBModel {
    tables:$DBModelTables = {}
    app:AppServe
    request:IncomingMessage
    response:ServerResponse
    constructor(app:AppServe, request:IncomingMessage, response:ServerResponse) {
        this.app = app;
        this.request = request;
        this.response = response;
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
            const info:$DBModelTablesItem = {
                ctx,
                path:e,
                name:((e.match(/([^/\\]*)\.ts$/) || [])[1] || ""),
                get:(conditions:Partial<Conditions> = {})=>{return this.get(info.name, conditions)},
                delete:(conditions:Partial<Conditions> = {})=>{return this.delete(info.name, conditions)},
                post:(data?:{[key:string]:any})=>{return this.post(info.name, data)},
                createAPI:(options: Partial<CreateAPI> = {})=>{return this.createAPI(info.name,options)},
            }
            // 自动同步model数据库配置
            const mysqlAuto:any = app.options.mysqlAuto
            if(mysqlAuto === true || (Object.prototype.toString.call(mysqlAuto) === '[object RegExp]' && mysqlAuto.test(request.url))){
                this.runMysqlModel(info)
            }
            this.tables[info.name] = info
        })
        return
    }

    async runMysqlModel(info:$DBModelTablesItem){
        if(info.ctx.default){
            try {
                await this.createTable(info.name, info)
            }catch (e){
                console.error(e)
            }
        }
    }

    columnsParsing(columns:DBModel_columns){
        const result = {};
        for (const k in columns){
            const data = columns[k] || {}
            let str = '';
            for (const dk in data){
                const key:any = dk.toLowerCase();
                const value:any = data[dk];
                switch (key) {
                    case 'tinyint':
                    case 'smallint':
                    case 'mediumint':
                    case 'int':
                    case 'integer':
                    case 'bigint':
                    case 'float':
                    case 'double':
                    case 'decimal':
                    case 'date':
                    case 'time':
                    case 'year':
                    case 'datetime':
                    case 'timestamp':
                    case 'char':
                    case 'varchar':
                    case 'tinyblob':
                    case 'tinytext':
                    case 'blob':
                    case 'text':
                    case 'mediumblob':
                    case 'mediumtext':
                    case 'longblob':
                    case 'longtext':
                        str += ` ${key}${Object.prototype.toString.call(value) === '[object Number]' ? `(${value})` : ''}`
                        break
                    case 'not_null':
                        str += value ? ` not null` : ``
                        break
                    case 'primary_key':
                        str += value ? ` primary key` : ``
                        break
                    case 'default':
                    case 'comment':
                        str += value ? ` ${key} ${value === null ? null : `'${value}'`}` : ``
                        break
                    case 'auto_increment':
                    case 'unique':
                        str += value ? ` ${key}` : ``
                        break
                }
            }
            result[k] = {
                data,
                str
            }
        }
        return result;
    }

    async createTable(tableName, tableConfig:$DBModelTablesItem){
        const config = tableConfig.ctx.default
        const columns = this.columnsParsing(config.columns);
        const columnsName = Object.keys(columns);
        const fieldsInfo = columnsName.map(e=>`${e} ${columns[e].str}`);
        // 创建表
        await this.runSql(`
            CREATE TABLE IF NOT EXISTS ${tableName}
            (
            ${fieldsInfo.join(",")}
            ${config.primary_key ? `, PRIMARY KEY (${config.primary_key.join(', ')})` : ''}
            ) ENGINE= ${config.engine || 'MyISAM'}
            ${config.charset ? `DEFAULT CHARSET= ${config.charset || 'utf8'}` : ''}
            ${config.commit ? `COMMENT = \'${config.commit}\'` : ''}
            ${config.using ? `USING = ${config.using ||  'BTREE'}` : ''}
            ROW_FORMAT = Dynamic
        ` , tableName,`创建表`)
        // 查询表字段
        const { results } = await this.runSql(`
            SELECT COLUMN_NAME as name from information_schema.COLUMNS where table_name = '${tableName}'
        ` , "information_schema.COLUMNS",`查询表${tableName}字段`)
        const table_columns:Array<any> = results.map(e=>e.name)
        const _old = columnsName.filter(e=>table_columns.includes(e))
        const _new = columnsName.filter(e=>!table_columns.includes(e))
        // 更新旧字段
        await Promise.all(_old.map(name=> this.runSql(`ALTER TABLE ${tableName} MODIFY ${name} ${columns[name].str.replace('primary key','')}`, tableName, "更新表字段")))
        // 添加行字段
        await Promise.all(_new.map(name=> this.runSql(`ALTER TABLE ${tableName} ADD ${name} ${columns[name].str.replace('primary key','')}`, tableName, "添加表字段")))
        // 更新表信息
        await this.runSql(`ALTER TABLE ${tableName}
            ${config.commit ? `COMMENT = \'${config.commit}\'` : ''}
            ${config.charset ? `DEFAULT CHARSET= ${config.charset || 'utf8'}` : ''}
            ${config.commit ? `COMMENT = \'${config.commit}\'` : ''}
            ${config.using ? `USING = ${config.using ||  'BTREE'}` : ''}
            ${config.engine ? `ENGINE = ${config.engine ||  'MyISAM'}` : ''}
        `, tableName, "更新表信息")
    }

    async runSql(sql, tableName, message){
        try {
            // 查询
            const res = await this.app.$DB.query(sql)
            ncol.color(function (){
                this.success('【SQL】执行成功：').log(message+"-> ").log(tableName+' ').info(sql)
            })
            console.log("=====================================================================")
            return res
        }catch (err){
            console.error(err.err.message)
            console.error(err.err.sql)
            console.log("=====================================================================")
            throw Error(err.err)
        }
    }

    async getConditionsSql(conditions:Partial<Conditions> = {}){
        let whereStr = '';
        let index = 0;
        if(Object.prototype.toString.call(conditions.where) === '[object Object]'){
            for (const k in conditions.where){
                const where = conditions.where[k]
                whereStr += index > 0 ? (where.and === true ? ' AND ' : '') : ''
                whereStr += index > 0 ? (where.or === true ? ' OR ' : '') : ''
                whereStr += ` ${k} `
                if(typeof where.like === 'string'){whereStr += ` like '${where.like}' `}
                else if(typeof where.is_null === 'boolean'){whereStr += ` IS NULL `}
                else if(typeof where.regexp === 'string'){whereStr += ` REGEXP '${where.regexp}' `}
                else if(typeof where.between === 'string'){whereStr += ` BETWEEN '${where.regexp}' `}
                else {whereStr += ` ${where.type || '='} '${where.value}' `}
                index += 1
            }
        }
        return `
            ${conditions.as ? `${conditions.as}` : ''}
            ${conditions.having ? `${conditions.having}` : ''}
            ${conditions.distinct ? `${conditions.distinct}` : ''}
            ${conditions.desc ? `order by ${conditions.desc.map(e=>`'${e}'`).join()} desc` : ''}
            ${conditions.asc ? `order by ${conditions.desc.map(e=>`'${e}'`).join()} asc` : ''}
            ${whereStr ? `where ${whereStr}` : ``}
            ${conditions.limit ? `limit ${conditions.limit.length === 2 ? `${conditions.limit[0]} , ${conditions.limit[1]}` : conditions.limit[0]}` : ''}
        `
    }

    async delete(tableName, conditions:Partial<Conditions> = {}){
        const {results, fields} = await this.runSql(`DELETE from ${tableName}`+await this.getConditionsSql(conditions), tableName, "查询表数据")
        return results
    }

    async get(tableName, conditions:Partial<Conditions> = {}){
        const {results, fields} = await this.runSql(`SELECT * from ${tableName}`+await this.getConditionsSql(conditions), tableName, "查询表数据")
        return results
    }

    async post(tableName, data = {}){
        const columns = this.tables[tableName].ctx.default.columns;
        const value = [];
        for (const k in columns){
            let v = data[k] || columns[k].default;
            if(!v && !['[object Boolean]','[object Number]'].includes(Object.prototype.toString.call(v))){
                v = null
            }
            value.push(`${k} = ${typeof v === 'string' ? `'${v}'` : v}`)
        }
        const {results} = await this.runSql(`
            INSERT INTO  ${tableName}
            SET
            ${value.join()}
        `, tableName, "新增表数据")
        return results
    }

    async createAPI(tableName, {get, delete:api_delete, post}:Partial<CreateAPI> = {}){
        const method = this.request.method.toLowerCase()
        if(method === 'get'){return  this.get(tableName, get || {})}
        else if(method === 'delete'){return  this.delete(tableName, api_delete || {})}
        else if(method === 'post'){return  this.post(tableName, post || {})}
        else {return  Promise.reject(`请求失败，不允许${method}查询！`)}
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
        this.$Serialize = new $Serialize(this, request, response);
        resolve()
    })
}

export default mysql

export interface CreateAPI {
    get?:Partial<Conditions>
    delete?:Partial<Conditions>
    post?:Partial<{[key:string]:any}>
}

export interface Conditions {
    // 条件查询
    where:whereConditions,
    // 倒叙
    desc:string [],
    // 正序
    asc:string [],
    // 限制
    limit:[number] | [number, number],
    // 去重复
    distinct:string,
    // 别名
    as:string,
    // 过滤分组
    having:string,
}

export interface whereConditions {
    [key:string]: Partial<{
        and: boolean,
        or: boolean,
        value: any
        like: string
        between: string
        is_null: boolean
        regexp: string
        type:string
    }>
}

export interface $DBModelTables {
    [key:string]: $DBModelTablesItem
}

export interface $DBModelTablesItem {
    name:string
    path:string
    ctx:$DBModelTablesCtx
    get?(conditions?:Partial<Conditions>):Promise<any>
    delete?(conditions?:Partial<Conditions>):Promise<any>
    post?(data?:{[key:string]:any}):Promise<any>
    createAPI?(options?: Partial<CreateAPI>):Promise<any>
}

export type $DBModelTablesCtx = {
    [key:string]:any
    default:DBModel
}

export interface DBModel {
    commit?:string // 注释
    collate?:'utf8_unicode_ci' | string  // 编码
    charset?:'utf8' // 字符集
    engine?:'MyISAM' | 'InnoDB' // 引擎
    using?:'BTREE' | 'HASH' // 使用
    columns:DBModel_columns// 表栏目
    primary_key?:string[] // 主键
}

export type DBModel_columns = {
    [columnName:string]:Partial<DBModel_columns_config>
}

export type DBModel_columns_config = {
    not_null:boolean
    auto_increment:boolean
    unique:boolean
    primary_key:boolean
    default:any
    comment:any
    // 数字
    tinyint:number| boolean // 1 字节	(-128，127)	(0，255)	小整数值
    smallint:number| boolean // 2 字节	(-32 768，32 767)	(0，65 535)	大整数值
    mediumint:number| boolean // 3 字节	(-8 388 608，8 388 607)	(0，16 777 215)	大整数值
    int:number| boolean // 4 字节	(-2 147 483 648，2 147 483 647)	(0，4 294 967 295)	大整数值
    integer:number| boolean // 4 字节	(-2 147 483 648，2 147 483 647)	(0，4 294 967 295)	大整数值
    bigint:number| boolean // 8 字节	(-9,223,372,036,854,775,808，9 223 372 036 854 775 807)	(0，18 446 744 073 709 551 615)	极大整数值
    float:number| boolean // 4 字节	(-3.402 823 466 E+38，-1.175 494 351 E-38)，0，(1.175 494 351 E-38，3.402 823 466 351 E+38)	0，(1.175 494 351 E-38，3.402 823 466 E+38)	单精度浮点数值
    double:number| boolean // 8 字节	(-1.797 693 134 862 315 7 E+308，-2.225 073 858 507 201 4 E-308)，0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308)	0，(2.225 073 858 507 201 4 E-308，1.797 693 134 862 315 7 E+308)	双精度浮点数值
    decimal:number| boolean // 对DECIMAL(M,D) ，如果M>D，为M+2否则为D+2	依赖于M和D的值	依赖于M和D的值	小数值
    // 日期时间
    date:number| boolean // 3	1000-01-01/9999-12-31	YYYY-MM-DD	日期值
    time:number| boolean // 3	'-838:59:59'/'838:59:59'	HH:MM:SS	时间值或持续时间
    year:number| boolean // 1	1901/2155	YYYY	年份值
    datetime:number| boolean // 8	1000-01-01 00:00:00/9999-12-31 23:59:59	YYYY-MM-DD HH:MM:SS	混合日期和时间值
    /**
     * 4
     * 1970-01-01 00:00:00/2038
     *
     * 结束时间是第 2147483647 秒，北京时间 2038-1-19 11:14:07，格林尼治时间 2038年1月19日 凌晨 03:14:07
     *
     * YYYYMMDD HHMMSS    混合日期和时间值，时间戳
     */
    timestamp:number| boolean
    // 字符
    char:number| boolean // 0-255字节	定长字符串
    varchar:number| boolean // 0-65535 字节	变长字符串
    tinyblob:number| boolean // 0-255字节	不超过 255 个字符的二进制字符串
    tinytext:number| boolean // 0-255字节	短文本字符串
    blob:number| boolean // 0-65 535字节	二进制形式的长文本数据
    text:number| boolean // 0-65 535字节	长文本数据
    mediumblob:number| boolean // 0-16 777 215字节	二进制形式的中等长度文本数据
    mediumtext:number| boolean // 0-16 777 215字节	中等长度文本数据
    longblob:number| boolean // 0-4 294 967 295字节	二进制形式的极大文本数据
    longtext:number| boolean // 0-4 294 967 295字节	极大文本数据
}

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
        $DB:DBSql
        $DBModel:$DBModel
        $Serialize:$Serialize
    }
}
