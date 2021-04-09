// wx.request封装
const app = getApp()

const request = (url, options) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${app.globalData.apiUrl}${url}`,//获取域名接口地址
      method: options.method, //配置method方法
      data: options.method === 'GET' ? options.data : JSON.stringify(options.data), 
      //如果是GET,GET自动让数据成为query String,其他方法需要让options.data转化为字符串
      header: {
        'Content-Type': 'application/json; charset=UTF-8',
        // 'token':token                     
      },
      //header中可以监听到token值的变化
      success(request) {
      //监听成功后的操作
        if (request.data.code === 0) {
        //此处10000是项目中数据获取成功后返回的值,成功后将request.data传入resolve方法中
          resolve(request.data)
        } else {
        //如果没有获取成功返回值,把request.data传入到reject中
          reject(request.data)
        }
      },
      fail(error) {
      //返回失败也同样传入reject()方法
        reject(error.data)
      }
    })
  })
}

module.exports = request