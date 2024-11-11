import {Controller} from "@wisdom-serve/serve"
import sqlCommit from "./sql-commit-function"
const sql = sqlCommit("./design-form.sql")
export const designFrom = (async function (){
    this.$success("设计表单")
}) as Controller
/**
 * 获取表单列表
 */
export const list = (async function (){
    const a = await this.$DB_$designForm.query(sql.list)
    console.log(a)
    this.$success("设计表单")
}) as Controller
