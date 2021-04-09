// 云函数入口文件
const cloud = require('./node_modules/wx-server-sdk')
const AipOcrClient = require("baidu-aip-sdk").ocr;
const APP_ID = APP_ID;
const API_KEY = API_KEY;
const SECRET_KEY = SECRET_KEY;

cloud.init()

// 云函数入口函数
exports.main = async (event, context) => {
  const client = new AipOcrClient(APP_ID, API_KEY, SECRET_KEY);
  let file = event.file
  // 调用通用文字识别, 图片参数为远程url图片
  let data = await client.generalBasicUrl(file).then(function(result) {
    let reulst = JSON.stringify(result)
    return reulst
  }).catch(function(err) {
      // 如果发生网络错误
      console.log(err)
  });

  return {
    data
  }
}