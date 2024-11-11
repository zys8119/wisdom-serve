import { Controller } from "@wisdom-serve/serve";
import sqlCommit from "./sql-commit-function";
const sql = sqlCommit("./design-form.sql");
export const designFrom = async function () {
  this.$success("设计表单");
} as Controller;
/**
 * 获取表单列表
 */
export const list = async function () {
  try {
    const pageSize = Number(this.$Serialize.get(this.$query,'pageSize')) || 10
    const page = Number(this.$Serialize.get(this.$query,'page')) || 1
    const {results, err, fields} = await this.$DB.query(sql.list,[
        `%${this.$Serialize.get(this.$query,'title','').replace(/'/g,'\\\'')}%`,
        (page-1)*pageSize,
        pageSize,
    ]);
    console.log(results);
    this.$success({
        data:results,
        total:results.length
    });
  } catch (e) {
    console.error(e);
    this.$error(e);
  }
} as Controller;
