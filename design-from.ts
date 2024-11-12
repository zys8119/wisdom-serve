import { Controller } from "@wisdom-serve/serve";
import sqlCommit from "./sql-commit-function";
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
    const title = this.$Serialize.get(this.$query,'title','')
    this.$success(this.$Serialize.getPage([
        await this.$DBModel_$designForm.tables.design_form.get({
            where:{
                title:{
                    value:"?",
                    source:true
                }
            }
        }, null,null,'\%asdas\%')
    ],{
        pageNo:page,
        pageSize,
        dataKeyField:'data',
    }));
  } catch (e) {
    console.error(e);
    this.$error(e);
  }
} as Controller;
