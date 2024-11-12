import { Controller } from "@wisdom-serve/serve";
import * as dayjs from "dayjs";
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
      title:this.$Serialize.get(true,this.$body,'title'),
    });
    this.$success();
  } catch (e) {
    console.error(e);
    this.$error(e);
  }
} as Controller;
/**
 * 更新表单
 */
export const updateForm = async function () {
  try {
    await this.$DBModel_$designForm.tables.design_form.update({
      title:this.$Serialize.get(true,this.$body,'title'),
      update_time:dayjs().format('YYYY-MM-DD HH:mm:ss'),
    },{
        where:{
            id:{value:this.$Serialize.get(true,this.$body,'id')}
        }
    });
    this.$success();
  } catch (e) {
    console.error(e);
    this.$error(e);
  }
} as Controller;
