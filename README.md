# node-serve

轻量级node 服务框架


# 参考文档

[MySql语法](http://c.biancheng.net/view/2548.html)

[mysql工具](https://www.npmjs.com/package/mysql#connection-options)

## 目录说明

```
build --------> 打包程序目录
    build.ts -------->  打包程序，将当前项目所有文件打包到dist目录，并且资源进行了代码混淆加密，作用于商业化代码
DB --------> mysql 数据表模型配置
src --------> 主要资源
    core-plug --------> 核心插件
        bodyData.ts --------> 获取body数据
        corsPlugin.ts --------> 跨域处理
        helperFun.ts --------> 帮助函数
        index.ts --------> 核心插件入口
        mailerPlugin.ts --------> 发送邮件插件
        mysql.ts --------> mysql封装插件
        package.json --------> 
        staticPlugin.ts --------> 静态资源插件，会将更目录下的 static 目录作为静态资源目录
        urlParse.ts --------> url路由解析
        websocket.ts --------> websocket插件
    serve -------->
        config --------> 服务底层默认配置
        types --------> ts类型补充
        HttpHeaderConfig.ts --------> http header头相关配置
        index.ts --------> 服务入口
        package.json -------->
        serve.ts --------> 服务程序，初始化服务程序（创建http服务、文件热更新、路由解析、合并插件并注入插件、请求方式拦截）
    utils -------->
        bufferSplit.ts --------> buffer 分割
        ForEach.ts --------> 递归循环 
        formData.ts --------> 解析前端 formData
        getNetworkIPaddress.ts --------> 获取请求来源的网络Ip地址
        getSvgCode.ts --------> 动态随机创建svg图形验证码
        index.ts --------> 工具入口
        mergeConfig.ts --------> 合并配置
        package.json --------> 
        RouteOptionsParse.ts --------> 路由解析
        ServeInfo.ts --------> 服务地址信息打印
static --------> 静态资源存放目录
.eslintrc.js --------> eslint 规则
.gitignore --------> git忽略
global.ts --------> 全局类型补充
LICENSE --------> 开源许可证
main.ts --------> 业务程序入口
package.json --------> 
package-lock.json -------->
README.md --------> 项目描述
route.ts --------> 路由文件，即api接口地址
tsconfig.json --------> ts配置
websocket.ts --------> websocket 事件监听
wisdom.serve.config.ts --------> 业务服务配置，可替换覆盖底层服务配置，优先级最高
```

## 使用指南

```typescript
import {createApp} from "@wisdom-serve/serve"
import "./global.ts"
import websocket from "./websocket"
// 创建服务
createApp({
    route:()=> import("./route"),
    websocket
})
// 使用插件
.use(PluginConfig)
// ...
// 监听服务
.listen()
// 服务成功回调
.then()
// 服务失败
.catch();
```
