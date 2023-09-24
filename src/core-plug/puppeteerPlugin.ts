import {Plugin} from "@wisdom-serve/serve/types/type";
import {Browser, launch, Page} from "puppeteer";
let browser:Browser
let page:Page

const puppeteerPlugin:Plugin = async function (request, response){
    if(!browser){
        browser =  await launch({
            // headless:false
        })
        const page = await browser.newPage()
        await page.goto('https://baidu.com')
        global.$page =  page
    }

}

export default puppeteerPlugin

declare module "@wisdom-serve/serve" {
    interface AppServeInterface {
    }
}
declare global{
    interface GlobalThis {
        $page:Page
    }
}
