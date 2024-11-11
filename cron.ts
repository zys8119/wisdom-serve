import { CronJob } from "cron";
import { DBSql } from "./src/core-plug/mysql";
import { createHash } from "crypto";
import { writeFileSync, removeSync,readFileSync, mkdirSync, rmdirSync } from "fs-extra";
import { resolve } from "path";
import axios from "axios";
import * as asposepdfnodejs from "asposepdfnodejs";
import config from "./wisdom.serve.config";
const db = new DBSql({ options: config } as any, null, null, null)
const chatDB = new DBSql({ options: config } as any, null, null,'chat', (config.extMysqlConfig as any).chat as any)
let isRuning = false;
const tempRoot = resolve(process.cwd(), "temp");
mkdirSync(tempRoot, { recursive: true });
rmdirSync(tempRoot, { recursive: true });
mkdirSync(tempRoot, { recursive: true });
const syncFileToRAG = async () => {
  if (isRuning) return;
  isRuning = true;
  try {
    const {results} = await chatDB.query(
        "select * from sync_file_to_rag where status = 1"
    )
    const files: any = (
        await db.query(`SELECT * FROM phoenix.fms_file WHERE ${results.length > 0 ? 'id not in (?) and' : ''} path LIKE '%.pdf'`,[results.map((item: any) => item.file_id)])
    ).results;
    const fileId = files[0].id
    const password = createHash("md5").update(fileId).digest("hex");
    const fileUrl = `http://192.168.110.242:10011/file/api/v1/file/download/${fileId}`;
    const { data: fileBuff } = await axios({
      url: fileUrl,
      responseType: "arraybuffer",
      headers: {
        userId: Date.now(),
        tenantId: Date.now(),
      },
    });
    const tmpFileName = resolve(tempRoot, 'tmp' + Date.now()+'.pdf');
    const tmpFileNameTo = resolve(tempRoot,'tmp2' + Date.now()+'.pdf');
    writeFileSync(tmpFileName, fileBuff as any);
    (await asposepdfnodejs()).AsposePdfDecrypt(tmpFileName, password, tmpFileNameTo);
    removeSync(tmpFileName)
    const buff = readFileSync(tmpFileNameTo)
    await axios({
        url:'http://127.0.0.1:82/api/v1/getChatToken',
        method:'post',
        headers:{
            "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkZXZpY2VLaW5kIjoyLCJleHAiOjE3MzEyODg0ODAsImlhdCI6MTczMTAyOTI4MCwiaXNBZG1pblVuaXQiOmZhbHNlLCJpc1N1cGVyQWRtaW4iOmZhbHNlLCJ0ZW5hbnRJZCI6IjUyNDA1NzE2OTA2MzIxMDczOCIsInVzZXJJZCI6IjUzNTMyNDU2MDMxMzA1MjkxNCJ9.OgsvnHoiCb6VerJmcBHFpe8C_gcpXeWEQhH0prwom-s"
        },
        data:{
            "data": {
                "tags": [
                    {
                        "label":files[0].origin_name,
                        "value": `data:application/pdf;base64,${Buffer.from(buff as any).toString("base64")}`,
                        "type": "file"
                    }
                ],
                "modelValue": ""
            },
            "aiAssistantChatId": "d5597807-8d3c-4a9e-a053-2e620f11804a"
        }
    })
    removeSync(tmpFileNameTo)
    await chatDB.query(
        "INSERT sync_file_to_rag (file_id, status) VALUES (?, 1);"
    ,[fileId])
  } catch (e) {
    console.log(e);
  }
  isRuning = false;
};
const task = async () => {
   await syncFileToRAG()
};
new CronJob("* * * * * *", task, null, true);
