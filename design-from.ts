import { Controller } from "@wisdom-serve/serve";
import {v4 as createUuid} from "uuid";
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
                    like:`%${title}%`,
                }
            }
        })
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
/**
 * 创建表单
 */
export const addForm = async function () {
  try {
    await this.$DBModel_$designForm.tables.design_form.post({
      id:createUuid(),
      title:this.$Serialize.get(true,this.$body,'title'),
      create_time:new Date().getTime(),
    });
    this.$success();
  } catch (e) {
    console.error(e);
    this.$error(e);
  }
} as Controller;
