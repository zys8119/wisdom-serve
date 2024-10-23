import { createApp } from "@wisdom-serve/serve";
import "./global";
import websocket from "./websocket";
import axios from "axios";
import { writeFileSync } from "fs";
import * as CryptoJS from "crypto-js";
createApp({
  route: () => import("./route"),
  websocket,
})
  .listen()
  .then();
  





























 
 
   
   
  const decrypt = function(_key, _iv, data) {
    // 示例：密文、密钥和IV
    const encryptedData = data;  // 这是要解密的 Base64 或十六进制格式的密文
    const key = CryptoJS.enc.Utf8.parse(_key); // 密钥，通常为 16/32 字节
    const iv = CryptoJS.enc.Utf8.parse(_iv);   // 初始化向量，16字节
    console.log(key, iv)
    console.log(CryptoJS.pad.Pkcs7)
    // 解密函数
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7
    });
    
    // 将解密结果转换为字符串
    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    console.log("解密后的内容:", decryptedText);
  }
   




;(async () => {
  const a = await axios({
    url: "http://192.168.110.242/file/resource/public/phoenix/other/2024-07-18/0190c47a-b3df-79e4-b091-a0290e7363e2.pdf",
    responseType: "arraybuffer",
  });
  console.log(decrypt('WqtvTTQveTO3z1WC', 'WqtvTTQveTO3z1WC', a.data))
  writeFileSync("z.pdf", a.data as any);
})();
