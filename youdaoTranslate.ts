import {Controller} from "@wisdom-serve/serve";
import {launch} from "puppeteer"
/**
 * bobplugin 翻译插件爬虫
 */
export default (async function (){
    try {
        const url =`https://fanyi.baidu.com/#${this.$body.source_lang.toLowerCase()}/${this.$body.target_lang.toLowerCase()}/${encodeURIComponent(this.$body.text)}`
        const browser = await launch({})
        const page = await browser.newPage()
        await page.goto(url)
        const selector = '#trans-selection'
        await page.waitForSelector(selector)
        const result = await page.evaluate((selector)=>{
            return (document.querySelector(selector) as HTMLDivElement)?.innerText
        }, selector)
        await browser.close()
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
