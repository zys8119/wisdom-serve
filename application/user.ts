import {Controller} from "@wisdom-serve/serve"
/**
 * 获取用户菜单
 */
export const get_menus_by_user:Controller = async function () {
    this.$success(await import("./menus.json"))
}

/**
 * 获取用户列表
 */
export const getUserList:Controller = async function () {
    this.$success(await this.$Serialize.getPage(
        [
            {
                results:await this.$DBModel.tables.user.get()
            }
        ],
        {
        pageNo:this.$query.get('page'),
        pageSize:this.$query.get('pageSize'),
        no_page:this.$query.get('no_page'),
    }))
}
