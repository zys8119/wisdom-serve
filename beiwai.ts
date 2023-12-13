import {Controller} from "@wisdom-serve/serve";
import {launch} from "puppeteer"

export default (async function (){
    const cookies = this.$body.cookies
    const pageUrl = this.$body.pageUrl
    const activeUnit = this.$body.activeUnit
    if(!cookies || !pageUrl || typeof activeUnit !== 'number'){
        return this.$error("请求参数错误")
    }
    const browser = await launch({
        // headless:false,
        defaultViewport:null
    })
    const page = await browser.newPage()
    await page.setCookie.apply(null,cookies)
    await page.goto(pageUrl)
    let res:any = await page.waitForSelector('.menu>ul').then(el=>{
        return el.evaluate(async ()=>{
            const res = []
            const el = document.querySelector('.menu>ul')
            for(const child of el.children){
                const items:any = {}
                items.title = (child.children[0] as HTMLDivElement).innerText
                items.child = ([...child.children[1].children] as HTMLDivElement[]).map((e:any)=>{
                    return {
                        title:e.querySelector('.child-text').innerText,
                        url:e.querySelector('a').href,
                        tag:e.querySelector('a .studyshijian .fangshi')?.innerText,
                        child:[...e.querySelectorAll('.child li')].map((e:any)=>e.querySelector('.playback-text').innerText)
                    }
                })
                res.push(items)
            }
            return res
        })
    })
    const coursevList = res
    const unitInfo = res[activeUnit]
    if(!unitInfo){
        return this.$error('单元不存在！')
    }
    res = unitInfo.child.filter(e=>e.tag === '练习')
    let index = 0
    const results = []
    while (res.length > index){
        const e = res[index]
        const p = await browser.newPage()
        await p.goto(e.url)
        await p.waitForSelector('iframe')
        await p.goto(p.frames()[1].url())
        await p.waitForSelector('.time-button').then(async res=>{
            const isClick = await p.evaluate(()=>{
                return document.querySelector<HTMLDivElement>('.time-button').innerText === '我要提交'
            })
            if(isClick){
                await res.click()
                await p.waitForSelector('.ivu-btn-primary').then(res=>{
                    return res.click()
                })
            }
        })
        const item = await p.evaluate(async (info:any)=>{
            return {
                title:info.title,
                data:[...document.querySelectorAll('.quiz-widget')].map(e=>{
                    return {
                        title:e.querySelector<HTMLDivElement>('.question-stem').innerText,
                        value:[...e.querySelectorAll<HTMLDivElement>('.choice-options .color-47A66F')].map(e=>e.innerText),
                    }
                })
            }
        },e)
        results.push(item)
        await p.close()
        index += 1
    }
    await browser.close()
    this.$success({
        coursevList,
        unitInfo,
        units:results
    })
}) as Controller
