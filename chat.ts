import { Controller } from "@wisdom-serve/serve"
import { DBSql } from "@wisdom-serve/core-plug/mysql"
import { readFileSync } from "fs"
export const chat = (async function () {
    const sql = readFileSync('sql.sql', 'utf8')
    console.log(sql)
    const sqlMap = {}
    console.log(sql.replace(/\/\*(.|\n)+?\*\//, function(m){
        return `$$___${m.match(/@.*/)?.[0].replace(/@/g,'')}___$$`
    }))
    const db = new DBSql(this, this.request, this.response, '242', {
        connectionLimit: 100,
        host: '192.168.110.242',
        user: 'root',
        password: 'Ul6WI12AuZomj76Kvl700-',
        port: 3306,
    })
    const res = await db.query('select 1')
    this.$success(res.results) 
}) as Controller