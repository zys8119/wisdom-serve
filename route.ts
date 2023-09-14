import {createRoute} from "@wisdom-serve/serve"
import axios from "axios"
import {ReadStream} from "fs"
import * as Keyv from "@keyvhq/core"
import * as KeyvMySQL from "@keyvhq/mysql"
export default createRoute({
    routes:[
        {
            path:"/v1/chat/completions",
            controller:async function (){
                try {
                    const res = await axios({
                        baseURL:'https://api.openai.com',
                        url:this.$url,
                        proxy:{
                            protocol:'http',
                            host:'127.0.0.1',
                            port:7890
                        },
                        method:this.request.method,
                        data:this.$body,
                        headers:{
                            'Content-Type': 'application/json',
                            authorization:`Bearer ${this.request.headers['authorization']}`
                        } as any,
                        responseType:'stream'
                    })  as {data:ReadStream}
                    await new Promise<void>((resolve, reject)=>{
                        this.response.writeHead(200, {
                            "access-control-allow-origin":this.request.headers.origin
                        })
                        res.data.on('data', e=>{
                            console.log(e)
                            this.response.write(e)
                        })
                        res.data.on('end', ()=>{
                            resolve()
                        })
                        res.data.on('error', e=>{
                            reject(e)
                        })
                    })
                }catch (e){
                    await new Promise<void>((resolve, reject)=>{
                        this.response.writeHead(403, {
                            "access-control-allow-origin":this.request.headers.origin
                        })
                        e.response.data.on('data', e=>{
                            console.log(e.toString())
                            this.response.write(e)
                        })
                        e.response.data.on('end', ()=>{
                            resolve()
                        })
                        e.response.data.on('error', e=>{
                            reject(e)
                        })
                    })
                }
            },
        },
        {
            path:"/v1/images/generations",
            controller:async function (){
                try {
                    const res = await axios({
                        baseURL:'https://api.openai.com',
                        url:this.$url,
                        proxy:{
                            protocol:'http',
                            host:'127.0.0.1',
                            port:7890
                        },
                        method:this.request.method,
                        data:this.$body,
                        headers:{
                            'Content-Type': 'application/json',
                            authorization:`Bearer ${this.request.headers['authorization']}`
                        } as any,
                    })
                    this.$send(JSON.stringify(res.data), {
                        headers:{
                            "Content-Type":"application/json; charset=utf-8",
                        }
                    })
                }catch (e){
                   this.$error(e.message)
                }
            },
        },
        {
            path:'/db',
            async controller(){
                const keyv = new Keyv({store: new KeyvMySQL('mysql://root:rootroot@localhost:3306/dbname')})
                for await (const  [,v] of  keyv.iterator() as any){
                    console.log(v)
                }
                this.$success()
            }
        },
        {
            path:'debug',
            async controller(){
                this.$success('asdasda')
            }
        },
        {
            path:'list',
            async controller(){
                try {
                    const token = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Ik1UaEVOVUpHTkVNMVFURTRNMEZCTWpkQ05UZzVNRFUxUlRVd1FVSkRNRU13UmtGRVFrRXpSZyJ9.eyJodHRwczovL2FwaS5vcGVuYWkuY29tL3Byb2ZpbGUiOnsiZW1haWwiOiJqeHpoYW5nODExOUBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZX0sImh0dHBzOi8vYXBpLm9wZW5haS5jb20vYXV0aCI6eyJ1c2VyX2lkIjoidXNlci1SWFJPREVHbElZdDhVUDZ2NkluNUZwRmYifSwiaXNzIjoiaHR0cHM6Ly9hdXRoMC5vcGVuYWkuY29tLyIsInN1YiI6Imdvb2dsZS1vYXV0aDJ8MTEzMjQwNzM4ODQwMDQ1OTAwMzY0IiwiYXVkIjpbImh0dHBzOi8vYXBpLm9wZW5haS5jb20vdjEiLCJodHRwczovL29wZW5haS5vcGVuYWkuYXV0aDBhcHAuY29tL3VzZXJpbmZvIl0sImlhdCI6MTY5MzM3Nzg1MSwiZXhwIjoxNjk0NTg3NDUxLCJhenAiOiJUZEpJY2JlMTZXb1RIdE45NW55eXdoNUU0eU9vNkl0RyIsInNjb3BlIjoib3BlbmlkIHByb2ZpbGUgZW1haWwgbW9kZWwucmVhZCBtb2RlbC5yZXF1ZXN0IG9yZ2FuaXphdGlvbi5yZWFkIG9yZ2FuaXphdGlvbi53cml0ZSBvZmZsaW5lX2FjY2VzcyJ9.I-4Yxxo2acdyzFbj0SOSoYAFbF-uCCW5n6uaClrNlfFyL2p5y08lADD5zKVZX0TXE0zFszTuGy8B9GDZGUkcYsychXmFyDn_HadHBOJDq1NAzTaI8M66UCS0exXUZTE-LXR7a697t08umMitaKzN_-nUAncQo_F1kORujJLzsVZIi-zwloIbj7UQHsYy1itNxGCZFmC9rml8CB2TVeuE_ak-Zo5i8BCTDEyb_uxiehXE6EYPdI3MvZ1iM5KntE4xMf1uUBF7_uqAUfOX9x1U93mfZj7anpPbrHJGeiWaVRe8kqgRHE8VRHTmpWKx5nHjeDlDHPgR5NHsBLoUD-LqLQ"
                    const res = await axios("https://chat.openai.com/api/auth/session", {
                        responseType:'json',
                        method: "get",
                        proxy:{
                            host:'127.0.0.1',
                            port:7890,
                            protocol:'http',
                        },
                        headers: {
                            // authorization: `Bearer ${token}`,
                            Cookie: `__Host-next-auth.csrf-token=4a40c5b031504005615b7e56aa81d2d05ba47b8ce998538ffed09ef7e1f5c85b%7Cec81d6e9e84a9ef49d856a2aea4d856f8d81c2b442376e8820e5386e13fae483; __cf_bm=NBPgnEhi4A_LTyjxLD1dLezZDcA7c_4Vj_z1IKMl6hk-1693377798-0-Aawyjvsl83bcoMGOODEO1yg397MxoK1oD1QfuuSliMAxX5ligkQCfqYdPjnRUffE3LqbxWHmGE0HLrZxf3dDhE0=; _cfuvid=mtIFtWhWYhN1rFNNTZm0mlu0BxzwHIxlt1pLHnxvhSY-1693377798608-0-604800000; __Secure-next-auth.callback-url=https%3A%2F%2Fchat.openai.com%2F; intercom-device-id-dgkjq2bp=4e8ec588-1ee9-42a4-bdb0-c96e4b1cde3b; cf_clearance=ylQiOYINRX2A0_S8.SvmOhQnIcILG1U0RByy6wE.jYc-1693378073-0-1-566ad4b1.a4aeda00.16b8b51-0.2.1693378073; _uasid="Z0FBQUFBQms3dVlhUS1fcFlDT3NhdVVvV2gxVTR5ZmZMa0M1WWMxVDVGeFkzVHhxc1N6NjhpNTlnTlgyTVg5dlNFbXhGNExZZHRTMlJyYjltNFp2RkpUbXc2aFdTQ3RLaU1vbzJoVXJUQW5ZNzhjWkVMWnkydWpqclAzbkxBVUpUVDNINGM1YWxhRmRtb0gySlNMcXlQR3N6X2FoVlYxbUFYcGQxU0pJeDgwVnJISlFUb3VaUUpQelRScXUzWUswN2xLc3hlVFpqT3otVTJDazdhWmFHTnhJVlZYU253UFpoVEhLSXp2dEtqaTVkRWxXZmUtbnBDMDRnUVM2b09ZSDhzUFdtbXFFeHhtN2tCMm9GbF9GbzFiWjV6V2NtSHBrWXBlM3R5M2ZyX1pyQS1kR2xMMmhKblEyUmZXSFk1M0w5SGZyVkVZS2F5Y0c5QjJzVkg1ak9nOThia05LcnJsQzJ3PT0="; intercom-session-dgkjq2bp=VzBLa1dGa3RvZVBnYjlaR1RqZmh2MG9XK3hINTdrZzhjaW50UGpQWHBHOStnNEI1K0p4OGxEc2RoYmVvZ21TYi0tMnpTTjlHeUVyQ210N2xiVTVIRHhEdz09--f170af3280a09836faea5485d263815b08634fc3; _dd_s=rum=0&expire=1693378983749; __Secure-next-auth.session-token=eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIn0..YNnOJFvPk8sH08sH.cgnqgEuIzPZ5kpu5ZWgDR65L1jiGrKkv5en-CcoYxozF-6wUJICNKhYByYFhRyrzLX4MVuwHjVa6OxE6iSvjRtbEZ7_-CcJGeWZUvjyuGyINoq1JKXmDxQcyztUk3PSMaZ3-eBEmp28m1DhMJJvwuA1EOPO0z9zXNAwsC2DzakjinuJjCppXPPu5je2XmR1o4Ei8vKVLsrU3Fbyqfu4jAsH1wWAA399DvBQUer8ERr2XVlJ10liprNtLfQ6EVatN6cA_mfFZ_pRRLl9iRPnKTWVe7RCt1WpcqKPtMPC9l4mM29N7xmPQiPBup7GD-2A64w-ik84lFP0EcDpgIw-aCn7SZBKZ3d9gdMX7_krbDqsThzDb1hQviQgMIpRI9jLfZlVPkHg0Q82Y8R-loXRDL-fTDzhDunNpOhDQfql1BKsmC376TylQcPP4rCgEZQpIyVPjhSNoEXqFRyKMEPNCjBa0Cc3P-W7d7mZXfuEi9ArXSu-PqsJvllku9hgDZk9IhDcWjRnXDufCnBOya0SWVqAZ2QJRJIgIHBJL1U9gyOZQ700IDDYz5ofVdsZOwSlwRQ1a0gg8UtTeLRWE0vKsNRNpI45gY6gk62QIofCG1iR9PxSOH98lfJ8iwt_o_2_nfrOhCvRXAN7uE40d4xNkvYZx6XMBgtCbBVJYtqsNLpjQu778j5StuZgvF8mbh9SKEpatnGeAL_LltatDD0AwYuIBzpaIdJxjOfOwXEuM98Sds_tU4tjPDIcEeFE8tkSTNp-stnOiYk0cluAt2CkGVBeauqM4oRzS9EzPVnpz6g7zgtrMuxlaTV4iB1smBXca0cH84l3XjYEKw5BXCkY0r5E9d2ZyOdDIzPsth7hnb4OxM0QIeJ-mh378ulEPT0Rq7N7c4scJn99vH3AWii6-Glt7ZJTYyxNoolUzI2MsowcZvvq0dLFppp56fS_KbcKcLBG6eVw0lxOV9kill14teulyLI7s_rmJN0rQcsg7nXjDhRZvMSDO6Xkj9Gp_oKRu2TOtQPwiPPeCcYFSZF5kppj0L4QxQbPlELOcILw8M4jKClHtuss6MUgyYqy5ryIrcI_42CDusnhY2I65Z4IiY5E1J8LE7OfZ_-N9NyaNJYENopo13rbH2J_-IX6SkGdzSwRir5P7djFc63U_RoKbuhtqaI--cMaiqyVbE4qda7LXzbgpqh0x6VQFm2vP-fBygRKauHizjunOjfgX7gW-9MapFG38MdnxV-Qv0JlRV6Nd7VdmgF62-IlHk3Sp1K0QIht4Bq66CpitKf7TDn_Mb8-YpVIH9VhgQSaoqWZR5yzJRbF5PH3XobrBxozTQfbsUfLco53vs-WXCGYBeGFc2XmvlKIeTP-hQqYRGEett21HY01Uy0TNrnXJRoZmSkLULX4FAqhZ-EBcAUtLZTDbWjOGX6aA0LsTeQ_dgGHsMmxZIE6En7t9mZiRPIMRm2A2DYlgr-2gudr74BUza6PRmczDH5nKpdlRD5kBQ_GSQrMJt4D7JSB4XBCYWVbsP9h7_EuN0CcDv4tJlKHFccaH5GBzhPAbIlH_VY41pHRegBNe0Tj2kXIloqFw-Sq19vZ1jsrcr8j7IKMUJqLfn41x3rd6nIXiFR3ew_BHvRIlt4jhkeR-mQ-ry5eljqyydM7wke9-W2WGhE60F9xF0TEEt46DbTwuX3QdysDM_4m3VbJi3uIXr3-0x3ZmatAFu1MObPtlQSNiM4AYiHhKy8o3adas02m_N1ZoKZa2OMx8gyRmo_lweDvw_7zwDu0J7QU4ialskoCrOqtVDYGJTHrL-44y5MvEHT9dhj6UM6et7Q1t1P3-4OFRJMtzfejXXAZFmqgZPq8iXbFGfvrc3d7Qr7-aqOPZO7eGMwkZM0OCxMTwcd2A2bwVIFkEhoLGAlSvugkCbRMkqdTO_w3uds9A9_3KEQ1TdS0rqt2mPjPIeU8iYdeaT1vuK1wH5dpzyxswPGM1S0Ja6pzurDb4Hu2Gkvh9Zzse3rghoHWbiqY8-y2mQ49SOP8znfk9AuyrQ_HZZOrN0NoU1B8VM8XiWci42fcSlQvIBD_WD_JOhlkN2xQoxJ-sIQirGdB26JZvDjJxppfE9nF4oMsd8HgR_4fwBBA1bPlUDpjzXrnd1Aq5vClLeIBk4ML3mhTzTIU6S1aS_a8mCE81VWs5YuXKLF29FZsAn7TpAaLt1fihIolgSFgb0mHFD89V1eMDRVAkqn9KArTvLP5kQ-v03-fLTp96dxoYYPsbK3a6w2QFShvX8To4mDJNSqqdK3mMBSe0aFVDSZex07dvuvvMzY6Q5WHOEgKj46lYJQUzxadJYRbi0pl0BNW89CMjdJo3P-V89uvUEiEBUhoU1mJylPBsWj2ql9T0QfADIGXrFF_wBbfpVeEh9ACgfy0MGrC3MuvOLenGP38dOdGNoVkpw859sw9jor2gqY_3jHuviS2kg1WOeWespb-0XcqNHU4OP97ALCaR5mCLHrxp2-DC3Qlx7gc2rz1M5B-VuU9yXEJWy1Ux7ZH-JhmXCSWDMIE-GJx05MqS6Eqeh2_FHvS3fpea_IqkKj6wmK5vYYVfrxHuDPERtbp0sJId0RADO6rT8_MYR2SV5YJN4MdGtz3qAaoTooNuRgxKFMrFhpPbntiLq-8RzhjP_G3FgPIlDV01lBn2nWoaV1kl4ZvaVzt1n6pq_j0VNdoqFGfbGQB6agE.B_neEkAEz2NHcOGqXK3E5A`,
                        },
                    })
                    this.$success(res?.data)
                }catch (e){
                    console.log(e)
                    this.$error(e?.response?.data)
                }
            }
        }
    ]
});
