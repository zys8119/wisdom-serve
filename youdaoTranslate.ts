import {Controller} from "@wisdom-serve/serve";
import {launch} from "puppeteer"
import {template} from "lodash"
import * as mammoth from "mammoth"
import {readFileSync} from "fs";
import axios from "axios";
import {sign} from "jsonwebtoken";
/**
 * bobplugin 翻译插件爬虫
 */
export default (async function (){
    try {
        const url =`https://fanyi.baidu.com/#${this.$body.source_lang.toLowerCase()}/${this.$body.target_lang.toLowerCase()}/${encodeURIComponent(this.$body.text)}`
        const browser = global.browser || await launch({})
        const page = global.page || await browser.newPage()
        await page.goto(url)
        const selector = '#trans-selection'
        await page.waitForSelector(selector)
        const result = await page.evaluate((selector)=>{
            return (document.querySelector(selector) as HTMLDivElement)?.innerText
        }, selector)
        global.browser = browser
        global.page = page
        // await browser.close()
        this.$send(JSON.stringify({
            "code": 0,
            "translateResult": [
                [
                    {
                        tgt:result,
                    }
                ]
            ],
            "type": "zh-CHS2en"
        }))
    }catch (e){
        this.$error()
    }
}) as Controller

export const test:Controller = async function (){
    this.$success(sign(this.$body, "my_jwt_secret"))
}

export const test2:Controller = async function (){
    this.$success()
}
