import {Controller} from "@wisdom-serve/serve"
import {launch} from "puppeteer"
export const puppeteer = (async function () {
    const browser = await launch({
        executablePath:'/usr/bin/chromium-browser',
        args:['--no-sandbox']
    })
    const page = await browser.newPage()
    await page.goto("https://www.baidu.com")
    const html = await page.evaluate(async ()=>{
        return document.body.innerHTML
    })
    await browser.close()
    this.$success(html)
} as Controller)