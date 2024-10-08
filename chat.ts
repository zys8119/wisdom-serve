import {Controller} from "@wisdom-serve/serve"
import {DBSql} from "@wisdom-serve/core-plug/mysql"
import {} from "mysql"
export const chat = (async function (){
    const db = new DBSql(this, this.request, this.response,'242',{
        connectionLimit : 100,
        host: '192.168.110.242',
        user: 'root',
        password: 'Ul6WI12AuZomj76Kvl700-',
        port: 3306,
    })
    const res = await db.query(`SELECT * FROM conference.conf_main `,'')
    console.log(res[0])
    this.$success('asdas')
}) as Controller