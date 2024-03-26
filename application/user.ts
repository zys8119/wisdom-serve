import {Controller} from "@wisdom-serve/serve"
/**
 * 获取用户菜单
 */
export const get_menus_by_user:Controller = async function () {
    this.$success(await import("./menus.json"))
}
