import {Controller} from "@wisdom-serve/serve";
import {exec, execSync} from "child_process";
import {mkdirSync, writeFileSync} from "fs-extra";
import axios from "axios"
import * as FormData from "form-data"

export default (async function (){
    try {
        const root = './nodeJsScan/data'
        // 代码检测
        const formdata = new FormData()
        formdata.append('file',this.$body.dist?.[0].fileBuff, {
            filename:'code.zip',
            contentType:'application/zip'
        })
        const {
            data:scan,
            status
        } = await axios({
            url:'http://192.168.110.140:9090/upload/',
            method:'post',
            headers:formdata.getHeaders(),
            data:formdata
        })
        // pnpm 依赖检测
        mkdirSync(root,{recursive:true})
        writeFileSync(`${root}/package.json`, this.$body.package?.[0].fileBuff || JSON.stringify({}))
        let json = null;

        await new Promise((resolve, reject) => {
            const childProcess = exec(`git init && pnpm i`, {cwd:root}, (error,stdout) => {
                if (error) {
                    reject(error)
                }else {
                    resolve(stdout)
                }
            })
            childProcess.stdout.on('data', d=>{
                console.log(`stdout: ${d}`);
            })
            childProcess.stderr.on('data', d=>{
                console.error(`stdout: ${d}`);
            })
        })
        try {
            json =  execSync('pnpm audit --json', {cwd:root}).toString()
        }catch (e) {
            json = e.stdout.toString()
        }
        this.$success({
            depsInfo:JSON.parse(json),
            scan
        })
    }catch (e){
        this.$error(e)
    }
}) as Controller
