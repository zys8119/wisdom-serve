import {AppServe, Plugin} from "@wisdom-serve/serve/types/type";
import {IncomingMessage, ServerResponse} from "http";
import {createPool, FieldInfo, MysqlError, Pool, QueryOptions} from "mysql";
import {sync} from "fast-glob";
import * as ncol from "ncol"
import {get, unionWith, isEqual} from "lodash"
import {v1 as uuidV1} from "uuid"

export class DBSql{
    private app:AppServe
    private request:IncomingMessage
    private response:ServerResponse
    constructor(app:AppServe, request:IncomingMessage, response:ServerResponse) {
        this.app = app
        this.request = request
        this.response = response
        global.$mysql_connection = global.$mysql_connection || createPool(app.options.mysqlConfig)
    }

    query(options: string | QueryOptions, values?: any):Promise<Partial<{
        results:any
        err:MysqlError
        fields:FieldInfo[]
    }>>{
        return new Promise((resolve, reject) => {
            global.$mysql_connection.query(options, values, (err, results, fields)=>{
                if(err){
                    reject({err})
                }else {
                    // 释放连接池
                    global.$mysql_connection.getConnection(((err1, connection) => {
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
                        data[k] = (defMap[k][0] as any)(data) as any
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

    /**
     * 获取数据
     * @param args
     */
    get(...args){
        const isRequired = args[0] === true
        if(isRequired){
            args = args.slice(1)
        }
        if(Object.prototype.toString.call(args[0]) === '[object URLSearchParams]'){
            args[0] = Object.fromEntries([...args[0].keys()].map(e=>[e, args[0].get(e)]))
        }
        const value = get.apply(get, args)
        if(isRequired && (['[object Null]', '[object Undefined]'].includes(Object.prototype.toString.call(value)) || (['[object String]'].includes(Object.prototype.toString.call(value)) && /^\s{0,}$/.test(value)))){
            const message = `字段【${args[1]}】必填项不能为空`
            this.app.$error(message)
            throw Error(message)
        }
        return value
    }

    /**
     * 获取分页格式数据
     */
    getPage(data:Array<Array<any> | {
        results:any[];
        [key:string]:any
    } | any>, {pageNo = 1, pageSize = 15,  no_page = false}:Partial<{
        // 当前页数
        pageNo:number | string,
        // 每页数量
        pageSize:number | string,
        // 是否分页
        no_page:boolean | string,
    }> = {}):Array<any> | {list:Array<any>, total:number, pageNo:number, pageSize:number}{
        const list = unionWith(data.reduce<Array<any>>((a,b)=>{
            return a.concat(Object.prototype.toString.call(b) === '[object Object]' ? (b as any).results : b);
        }, []), isEqual);
        if(no_page === true || (typeof no_page === 'string' && no_page.toLowerCase() === "true")){
            return list
        }else {
            pageNo = Number(pageNo)
            pageSize = Number(pageSize)
            return {
                list:list.slice((pageNo - 1) * pageSize, pageSize),
                total:list.length,
                pageNo,
                pageSize
            }
        }
    }
}

export class $DBModel {
    tables:$DBModelTables = {}
    app:AppServe
    request:IncomingMessage
    response:ServerResponse
    outSql:boolean
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
                get:(outSql?:any, conditions:any = {}, isExists?:boolean)=>{
                    if(conditions === true){
                        isExists = true
                    }
                    if(outSql !== true){
                        conditions = outSql
                    }
                    this.outSql = outSql === true;
                    return this.get(info.name, conditions, isExists)
                },
                delete:(outSql?:any, conditions:Partial<Conditions> = {})=>{
                    if(outSql !== true){
                        conditions = outSql
                    }
                    this.outSql = outSql === true;
                    return this.delete(info.name, conditions)
                },
                post:(outSql?:any, data?:{[key:string]:any})=>{
                    if(outSql !== true){
                        data = outSql
                    }
                    this.outSql = outSql === true;
                    return this.post(info.name, data)
                },
                update:(outSql?:any, data:{[key:string]:any} = {}, conditions:Partial<Conditions> = {})=>{
                    if(outSql !== true){
                        conditions = data
                        data = outSql
                    }
                    this.outSql = outSql === true;
                    return this.update(info.name, data, conditions)
                },
                createAPI:(outSql?:any, options: Partial<CreateAPI> = {})=>{
                    if(outSql !== true){
                        options = outSql
                    }
                    this.outSql = outSql === true;
                    return this.createAPI(info.name,options)
                },
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
        `,`创建表`, tableName)
        // 查询表字段
        const { results } = await this.runSql(`
            SELECT COLUMN_NAME as name from information_schema.COLUMNS where TABLE_NAME = '${tableName}' and TABLE_SCHEMA = '${this.app.options.mysqlConfig.database}'
        ` ,`查询表${tableName}字段`, "information_schema.COLUMNS")
        const table_columns:Array<any> = results.map(e=>e.name)
        const _old = columnsName.filter(e=>table_columns.includes(e))
        const _new = columnsName.filter(e=>!table_columns.includes(e))
        // 更新旧字段
        await Promise.all(_old.map(name=> this.runSql(`ALTER TABLE ${tableName} MODIFY ${name} ${columns[name].str.replace('primary key','')}`, "更新表字段", tableName)))
        // 添加行字段
        await Promise.all(_new.map(name=> this.runSql(`ALTER TABLE ${tableName} ADD ${name} ${columns[name].str.replace('primary key','')}`, "添加表字段", tableName)))
        // 更新表信息
        await this.runSql(`ALTER TABLE ${tableName}
            ${config.charset ? `DEFAULT CHARSET= ${config.charset || 'utf8'}` : ''}
            ${config.commit ? `COMMENT = \'${config.commit}\'` : ''}
            ${config.using ? `USING = ${config.using ||  'BTREE'}` : ''}
            ${config.engine ? `ENGINE = ${config.engine ||  'MyISAM'}` : ''}
        `, "更新表信息", tableName)
    }

    async runSql(sql, message?:string|boolean, tableName?:string):Promise<{
        results:any[],
        fields:any[]
    }>{
        try {
            if(typeof sql === "string"){
                // 删除不必要的空字符
                sql = sql
                    .replace(/\n/img,"")
                    .replace(/ +/img," ")
            }
            if(this.outSql === true || message === true){
                this.outSql = false;
                return Promise.resolve({
                    results:sql,
                    fields:null
                });
            }
            // 查询
            const res = await this.app.$DB.query(sql)
            if(this.app.options.debug){
                ncol.color(function (){
                    let _this = this.success('【SQL】执行成功：');
                    if(message){
                        _this = _this.log(message+"-> ");
                    }
                    if(tableName){
                        _this = _this.log(tableName+' ');
                    }
                    _this.info(sql+';')
                })
                console.log("=====================================================================")
            }
            return res as any
        }catch (err){
            ncol.error(err.err.message)
            ncol.error(err.err.sql+';')
            console.log("=====================================================================")
            throw Error(err.err)
        }
    }

    async getWhere(whereConditions:Partial<whereConditions>){
        let whereStr = '';
        let index = 0;
        if(Object.prototype.toString.call(whereConditions) === '[object Object]'){
            for (const k in whereConditions){
                const where = whereConditions[k]
                const isValid = (k:string, v:string, type?:number)=> {
                    const isArray = Object.prototype.toString.call(where[k]) === '[object Array]';
                    const isString = typeof where[k] === 'string';
                    const isBoolean = typeof where[k] === 'boolean';
                    const keyName = v || (typeof k === 'string' ? k.toUpperCase() : null)
                    let str = null
                    switch (type) {
                        case 1:
                            str = index > 0 ? (where[k] === true ? ` ${keyName} ` : '') : ''
                            break
                        case 2:
                            if(isString){ str = ` ${keyName} '${where[k]}' ` }
                            break
                        case 3:
                            if(isBoolean){ str = ` ${keyName} ` }
                            break
                        case 4:
                            str = ` ${k} `
                            break
                        case 5:
                            if(isString || (isArray && where[k].length > 0)){ str =  ` ${keyName} (${isArray ? where[k].map(e=>`'${e}'`).join(" , ") : where[k]}) ` }
                            break
                        case 6:
                            str = ` ${where.type || '='} ${where.source ? where.value : `'${where.value}'`} `
                            break
                        case 7:
                            if(isString || (isArray && where[k].length > 0)){ str =  ` (${isArray ? where[k].map(e=>`'${e}'`).join(" , ") :  where[k]}) ` }
                            break
                    }

                    return str
                }
                const prefix = [
                    isValid('and','AND', 1),
                    isValid('or','OR', 1),
                ]
                if(k === '$arrStr'){
                    whereStr += prefix.concat(isValid('value',null, 7)).join(" ")
                }else {
                    if(Object.prototype.toString.call(where) === '[object Object]'){
                        const conditions = [
                            isValid('like','LIKE', 2),
                            isValid('is_null','IS NULL', 3),
                            isValid('regexp','REGEXP', 2),
                            isValid('between','BETWEEN', 2),
                            isValid('in','IN',5),
                            isValid('not_in','NOT IN',5),
                            isValid('exists','EXISTS',5),
                            isValid('not_exists','NOT EXISTS',5),
                            isValid(null,null,6),
                        ].find(e=>e);
                        if(conditions){
                            whereStr +=  prefix.concat([
                                isValid(k,k, 4),
                            ]).filter(e=>e).join(" ");
                            whereStr += conditions
                        }
                    }
                }
                index += 1
            }
        }
        return whereStr
    }

    async createSQL(conditions:Partial<Conditions> = {}, $arrStr?:boolean){
        const whereStr = await this.getWhere(conditions.where as whereConditions)
        const onStr = await this.getWhere(conditions.on as whereConditions)
        return `
            ${conditions.insert ? ` INSERT ${conditions.insert === true ? '' : conditions.insert} ` : ''}
            ${conditions.insert_into ? ` INSERT INTO ${conditions.insert_into === true ? '' : conditions.insert_into} ` : ''}
            ${conditions.update ? ` UPDATE ${conditions.update === true ? '' : conditions.update} ` : ''}
            ${conditions.delete ? ` DELETE ${conditions.delete === true ? '' : conditions.delete} ` : ''}
            ${conditions.select ? ` SELECT ${
            conditions.select === true ?
                '*' :
                Object.prototype.toString.call(conditions.select) === '[object Array]' ?
                    (conditions.select as string[]).join(" , ") :
                    conditions.select
        } ` : ''}
            ${conditions.count ? `SELECT count(${Object.prototype.toString.call(conditions.count) === '[object Object]' ? ((conditions.count as any).select || '*') : '*'}) as  ${conditions.count === true ? 'total' : (Object.prototype.toString.call(conditions.count) === '[object Object]' ? ((conditions.count as any).name || 'total') : conditions.count)}` : ''}
            ${conditions.from ? ` FROM ${conditions.from === true ? '' : conditions.from} ` : ''}
            ${conditions.gather ? ` ( ${conditions.gather} ) ` : ''}
            ${conditions.gather_alias ? ` ${conditions.gather_alias} ` : ''}
            ${conditions.join ? ` JOIN ${conditions.join === true ? '' : conditions.join} ` : ''}
            ${conditions.inner_join ? ` INNER JOIN ${conditions.inner_join === true ? '' : conditions.inner_join} ` : ''}
            ${conditions.left_join ? ` LEFT JOIN ${conditions.left_join === true ? '' : conditions.left_join} ` : ''}
            ${conditions.right_join ? ` RIGHT JOIN ${conditions.right_join === true ? '' : conditions.right_join} ` : ''}
            ${conditions.left_outer_join ? ` LEFT OUTER JOIN ${conditions.left_outer_join === true ? '' : conditions.left_outer_join} ` : ''}
            ${conditions.right_outer_join ? ` RIGHT OUTER JOIN ${conditions.right_outer_join === true ? '' : conditions.right_outer_join} ` : ''}
            ${conditions.as ? ` ${conditions.as} ` : ''}
            ${conditions.on ? ` ${$arrStr ? '' : 'on'} ${typeof conditions.on === "string" ? conditions.on : onStr} ` : ``}
            ${conditions.where ? ` ${$arrStr ? '' : 'WHERE'} ${typeof conditions.where === "string" ? conditions.where : whereStr} ` : ``}
            ${conditions.having ? ` ${conditions.having} ` : ''}
            ${conditions.distinct ? `DISTINCT ${conditions.distinct} ` : ''}
            ${conditions.desc ? ` order by ${conditions.desc.map(e=>`'${e}'`).join()} desc ` : ''}
            ${conditions.asc ? ` order by ${conditions.desc.map(e=>`'${e}'`).join()} asc ` : ''}
            ${conditions.limit ? ` limit ${conditions.limit.length === 2 ? ` ${conditions.limit[0]} , ${conditions.limit[1]} ` : conditions.limit[0]} ` : ''}
        `
    }

    async delete(tableName, conditions:Partial<Conditions> = {}){
        const {results} = await this.runSql(`DELETE from ${tableName} `+await this.createSQL(conditions), "查询表数据", tableName)
        return results
    }

    async get(tableName, conditions:Partial<Conditions> = {}, isExists?:boolean){
        const {results} = await this.runSql(`SELECT * from ${tableName} `+await this.createSQL(conditions), "查询表数据", tableName)
        if(isExists){
            return results.length > 0;
        }
        return results
    }

    async getPostSql(tableName, data, isUpdate){
        const columns = this.tables[tableName].ctx.default.columns;
        const value = [];
        if(isUpdate){
            for (const k in data){
                if(columns[k]){
                    const v = data[k];
                    value.push(`${k} = ${typeof v === 'string' ? `'${v}'` : v}`)
                }
            }
        }else {
            for (const k in columns){
                let v = data[k] || columns[k].default;
                if(!v && !['[object Boolean]','[object Number]'].includes(Object.prototype.toString.call(v))){
                    v = null
                }
                if(columns[k].is_uuid){
                    v = uuidV1()
                }
                value.push(`${k} = ${typeof v === 'string' ? `'${v}'` : v}`)
            }
        }

        return `
            SET
            ${value.join()}
        `
    }

    async post(tableName, data = {}, conditions:Partial<Conditions> = {}){
        const {results} = await this.runSql(`INSERT INTO  ${tableName} ` + await this.getPostSql(tableName, data, false), "新增表数据", tableName)
        return results
    }

    async update(tableName, data = {}, conditions:Partial<Conditions> = {}){
        const {results} = await this.runSql(`UPDATE  ${tableName} ` + await this.getPostSql(tableName, data, true) + await this.createSQL(conditions),  "新增表数据", tableName)
        return results
    }

    async createAPI(tableName, {get:getData, delete:api_delete, post, update}:Partial<CreateAPI> = {}){
        const update_data = get(update,"data",{})
        const update_conditions = get(update,"conditions",{})
        const method = this.request.method.toLowerCase()
        if(method === 'get'){return  this.get(tableName, getData || {})}
        else if(method === 'delete'){return  this.delete(tableName, api_delete || {})}
        else if(method === 'post'){return  this.post(tableName, post || {})}
        else if(method === 'update'){return  this.update(tableName, update_data || {}, update_conditions || {})}
        else if(method === 'put'){return  this.update(tableName, update_data || {}, update_conditions || {})}
        else if(method === 'patch'){return  this.update(tableName, update_data || {}, update_conditions || {})}
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
    update?:{
        data?:Partial<{[key:string]:any}>,
        conditions?:Partial<Conditions>
    }
}

export interface Conditions {
    // 条件查询
    where:string | whereConditions,
    on:string | whereConditions
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
    // 标识
    insert:string | boolean
    insert_into:string | boolean
    update:string | boolean
    delete:string | boolean
    select:string | boolean | string []
    count:any  // 总数， 默认名称 total
    from:string | boolean
    join:string | boolean
    inner_join:string | boolean
    left_join:string | boolean
    right_join:string | boolean
    left_outer_join:string | boolean
    right_outer_join:string | boolean
    // 集合
    gather:string
    // 集合别名
    gather_alias:string
}

export interface whereConditions {
    // 集合查询
    $arrStr?: Partial<whereConditionsItem>
    [key:string]: Partial<whereConditionsItem>
}

export interface whereConditionsItem {
    // 并且，从二字段才生效
    and: boolean,
    // 或者，从二字段才生效
    or: boolean,
    // 对应key值
    value: any
    // 对应key源值,即不进行转义
    source: boolean
    // 模糊查询
    like: string
    // 区域查询
    between: string
    // 不是null
    is_null: boolean
    // 正则查询
    regexp: string
    // 对应key值的运算符，例如：=、>、<、>=、<=
    type:string
    // 子查询
    in:string | any[]
    not_in:string
    exists:string
    not_exists:string
}

export interface $DBModelTables {
    [key:string]: $DBModelTablesItem
}

export interface $DBModelTablesItem {
    name:string
    path:string
    ctx:$DBModelTablesCtx
    get?(conditions?:Partial<Conditions>, isExists?:boolean):Promise<any>
    get?(conditions?:Partial<Conditions>):Promise<any>
    get?(outSql?:boolean, conditions?:Partial<Conditions>):Promise<any>
    get?(outSql?:boolean, conditions?:Partial<Conditions>, isExists?:boolean):Promise<any>
    delete?(conditions?:Partial<Conditions>):Promise<any>
    delete?(outSql?:boolean, conditions?:Partial<Conditions>):Promise<any>
    post?(data?:{[key:string]:any}):Promise<any>
    post?(outSql?:boolean, data?:{[key:string]:any}):Promise<any>
    update?(data?:{[key:string]:any}, conditions?:Partial<Conditions>):Promise<any>
    update?(outSql?:boolean, data?:{[key:string]:any}, conditions?:Partial<Conditions>):Promise<any>
    createAPI?(options?: Partial<CreateAPI>):Promise<any>
    createAPI?(outSql?:boolean, options?: Partial<CreateAPI>):Promise<any>
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
    is_uuid:boolean // 是否为uuid模式， 如果是则改字段写入数据将自动写入uuid格式
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
