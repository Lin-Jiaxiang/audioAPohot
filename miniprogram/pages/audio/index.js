// miniprogram/pages/audio/index.js
const app = getApp()
import { getMainPage} from '../api/api.js'
import api from '../../utils/request.js'

import Dialog from '../../components/dialog/dialog';
const innerAudioContext = wx.createInnerAudioContext()
innerAudioContext.src = 'https://chatbot.yamagata-ai.com/files/mp3/stop.mp3'
const recorderManager = wx.getRecorderManager()
const recorderConfig = { 
  duration: 600000, 
  frameSize: 5, 
  format: 'PCM', 
  sampleRate: 16000, 
  encodeBitRate: 96000, 
  numberOfChannels: 1 
}
let init;

const debounce = (func, wait) => {
  let timeout;
  return function() {
    const context = this
    const args = arguments
    clearTimeout(timeout)
    timeout = setTimeout(function(){
      func.apply(context, args)
    }, wait)
  }
}

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 0,
    icon: [
      {
        normal: '../../images/audio.png',
        active: '../../images/audio-active.png',
        title: '语音识别'
      },
      {
        normal: '../../images/OCR.png',
        active: '../../images/OCR-active.png',
        title: '文字识别'
      }
    ],
    tabHeight: '',
    value: '',
    text: '点击下方按钮开始识别',
    valueEn: '',
    textEn: '',
    textDis: 'block',
    status: 0,
    click: true,
    time: 10 * 60 * 1000,
    timeData: {},
    list: '',
    recTime: '0',
    hour:0,
    minute:0,
    second:0,
    millisecond:0,
    timecount:'0:00:00',
    cost:0,
    flag:1,
    endtime:"",
    checked: false,
    switchText: "打开实时翻译",
    emailValue: '',
    emailError: '',
    voiceAnim: ['slideInUp0','slideInUp1','slideInUp2','slideInUp3','slideInUp4','slideInUp5','slideInUp6','slideInUp7','slideInUp8','slideInUp9','slideInUp10','slideInUp11','slideInUp12','slideInUp13','slideInUp14']
  },
  
  uploadMp3(){
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      success (res) {
        let name = res.tempFiles[0].name
        wx.uploadFile({
          url: app.globalData.apiUrl + '/audio/text?openid=' + app.globalData.openid + '&name=' + name, //仅为示例，非真实的接口地址
          filePath: res.tempFiles[0].path,
          name: 'file',
          formData: {
            'openid': app.globalData.openid
          },
          success (res){
            let code = JSON.parse(res.data).code
            if(code == 0){
              wx.navigateTo({
                url: '/pages/upload/index'
              })
            }else{
              wx.showToast({title: '上传失败'})
            }
          },
          fail(err){
            console.log(err)
          }
        })
      }
    })
  },

  openTran({ detail }){
    let text = detail == false ? '打开实时翻译' : '关闭实时翻译'
    this.setData({ 
      checked: detail,
      switchText: text
    });
  },

  emailValueChange(event){
    this.setData({
      emailValue: event.detail
    })
  },

  onChange() {
    wx.redirectTo({
      url: '/pages/photo/index',
    })
  },

  onChangeTime(e) {
    this.setData({
      timeData: e.detail,
    });
  },
 
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.getRecPower()
  },

  getRecPower() {
    let _this = this
    wx.authorize({
      scope: 'scope.record',
      success() {
        console.log("录音授权成功");
        //第一次成功授权后 状态切换为2
        _this.setData({
          status: 2,
        })
        // 用户已经同意小程序使用录音功能，后续调用 wx.startRecord 接口不会弹窗询问
        // wx.startRecord();
      },
      fail() {
        console.log("第一次录音授权失败");
        wx.showModal({
          title: '提示',
          content: '您未授权录音，功能将无法使用',
          showCancel: true,
          confirmText: "授权",
          confirmColor: "#52a2d8",
          success: function (res) {
            if (res.confirm) {
              //确认则打开设置页面（重点）
              wx.openSetting({
                success: (res) => {
                  console.log(res.authSetting);
                  if (!res.authSetting['scope.record']) {  
                    //未设置录音授权
                    console.log("未设置录音授权");
                    wx.showModal({
                      title: '提示',
                      content: '您未授权录音，功能将无法使用',
                      showCancel: false,
                      success: function (res) {

                      },
                    })
                  } else {
                    //第二次才成功授权
                    console.log("设置录音授权成功");
                    _this.setData({
                      status: 2,
                    })
                  }
                },
                fail: function () {
                  console.log("授权设置录音失败");
                }
              })
            } else if (res.cancel) {
              console.log("cancel");
            }
          },
          fail: function () {
            console.log("openfail");
          }
        })
      }
    })
  },

  copyText: debounce(function(){
    let _this = this
    let contentZh = '中文：' + _this.data.text
    let contentEn = '\n' + '英文：' + _this.data.textEn
    let content = _this.data.checked == true ? contentZh + contentEn : contentZh
    wx.setClipboardData({
      data: content,
      success: function (res) {
        wx.showToast({
          title: '复制成功',
          duration: 1000
        })
      }
    })
  },1000),

  start:function(){
    clearInterval(init);
    var that=this;
    that.setData({
      hour:0,
      minute:0,
      second:0,
    })
    init=setInterval(function(){
      that.timer()
    },50);
  },

  stop:function(){
    clearInterval(init);
    this.setData({
      hour:0,
      minute:0,
      second:0,
      millisecond:0,
      timecount:'0:00:00'
    })
  },

  timer:function(){
    var that = this;
    that.setData({
      millisecond:that.data.millisecond+5
    })
    if(that.data.millisecond>=100){
      that.setData({
        millisecond:0,
        second:that.data.second + 1,
      })
      let animData = that.data.voiceAnim
      for(let i in animData){
        animData[i] = Math.random()*90
      }
    }
    if(that.data.second >= 60){
      that.setData({
        second:0,
        minute:that.data.minute+1
      })
    }
    if(that.data.minute==59){
      innerAudioContext.play()
    }
    if(that.data.minute>=60){
      that.setData({
        minute:0,
        hour:that.data.hour+1
      })
    }
    let hour = that.data.hour 
    let minute = that.data.minute < 10 ? '0' + that.data.minute : that.data.minute;
    let second = that.data.second < 10 ? '0' + that.data.second : that.data.second;
    that.setData({
      timecount: hour + ":" + minute + ":" + second
    })
  },

  tran(data, el){
    let _this = this
    wx.request({
      url: 'https://image.yamagata-ai.com/api/res/tran', //仅为示例，并非真实的接口地址
      data: {
        tran: data
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success (res) {
        let dst = res.data.data[0].dst
        if(el == 'text'){
          _this.setData({
            textEn: dst
          })
        }else{
          _this.setData({
            valueEn: dst
          })
        }
      }
    }) 
  },

  linkSocket() {
    let _this = this
    let sn = new Date().getTime()
    _this.setData({
      text: '',
      textEn: '',
      click: false,
    })
    wx.showLoading({
      title: '识别中...'
    })
    
    _this.start()
    recorderManager.start(recorderConfig)
    wx.connectSocket({
      url: app.globalData.wsUrl + '?sn=' + sn,
      protocols: ['websocket'],
      success() {
        console.log('连接成功')
        _this.initEventHandle()
      }
    })
  },

  initEventHandle() {
    let _this = this
    wx.onSocketMessage((res) => {
      let result = JSON.parse(res.data.replace('\n',''))
      if(result.type == 'MID_TEXT'){
        if(_this.data.checked == true){
          _this.tran(result.result, 'value')
        }
        _this.setData({
          textDis: 'none',
          value: result.result,
        })
      }
      if(result.type == 'FIN_TEXT'){
        let value = _this.data.text
        let tranStr = value + result.result
        if(_this.data.checked == true){
          _this.tran(tranStr, 'text')
        }
        _this.setData({
          value: '',
          valueEn: '',
          textDis: 'block',            
          text: tranStr,
        })           
      }
    })
    wx.onSocketOpen(() => {
      _this.wsStart()
      console.log('WebSocket连接打开')
    })                                                      
    wx.onSocketError(function (res) {
      console.log('WebSocket连接打开失败')
    })
    wx.onSocketClose(function (res) {
      console.log('WebSocket 已关闭！')
    })
  },

  wsStart() {
    let config = {
      type: "START",
      data: {
        appid: appid,
        appkey: appkey,
        dev_pid: 15372,
        cuid: "cuid-1",
        format: "pcm",
        sample: 16000
      }
    }
    wx.sendSocketMessage({
      data:JSON.stringify(config),
      success(res){
        console.log('发送开始帧成功')
      }
    })
  },

  wsSend(data){
    wx.sendSocketMessage({
      data:data,
      success(res){
        // console.log('发送数据帧成功')
      }
    })
  },

  wsStop(){
    let _this = this
    this.setData({
      click: true,
    })
    _this.stop()
    let config = {
      type: "FINISH"
    }
    wx.hideLoading()
    recorderManager.stop()
    wx.sendSocketMessage({
      data:JSON.stringify(config),
      success(res){
        console.log('发送结束帧成功')
        _this.sendSMS()
      }
    })
  },

  wsStopForAcc(){
    let _this = this
    this.setData({
      click: true,
    })
    let config = {
      type: "FINISH"
    }
    wx.sendSocketMessage({
      data:JSON.stringify(config),
      success(res){
        wx.hideLoading()
        console.log('发送结束帧成功')
        _this.sendSMS()
      }
    })
  },

  dialogConfirm(event){
    let _this = this
    let reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/
    if(reg.test(_this.data.emailValue)){
      let contentZh = '中文：' + _this.data.text
      let contentEn = '\n' + '英文：' + _this.data.textEn
      let content = _this.data.checked == true ? contentZh + contentEn : contentZh
      wx.request({
        url: app.globalData.apiUrl + '/audio/send', 
        method: 'post',
        data: {
          name: '测试用户',
          email: _this.data.emailValue,
          content: content
        },
        header: {
          'content-type': 'application/json' // 默认值
        },
        success (res) {
          wx.showToast({title:'发送成功'})
          Dialog.close();
          _this.setData({
            emailError: '',
            emailValue: ''
          })
        }
      }) 
    }else{
      _this.setData({
        emailError: '邮箱验证失败'
      })
      event.detail.dialog.stopLoading();
    }
  },

  dialogCancel(event){
    event.detail.dialog.stopLoading();
    Dialog.close();
    this.setData({
      emailError: '',
      emailValue: ''
    })
  },

  sendSMS(){
    let _this = this
    if(_this.data.text == "") {
      wx.showToast({title: '当前无内容', icon: 'none'})
      return false
    }
    Dialog.confirm({
      title: '是否要发送当前识别的内容到您的邮箱？',
      message: '弹窗内容',
      asyncClose: true
    })
      .then(() => {
      })
      .catch(() => {
        Dialog.close();
      });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let _this = this
    const query = wx.createSelectorQuery()
    query.select('.class1').boundingClientRect()
    query.exec(function (res) {
      _this.setData({
        tabHeight: res[0].height + 'px'
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    let _this = this
    recorderManager.onFrameRecorded(function (res){
      let data = res.frameBuffer
      _this.wsSend(data)
    })

    recorderManager.onInterruptionBegin(function (res){
      console.log('录音中断，保存内容')
      _this.wsStopForAcc()
      let text = _this.data.text
      if(text == ""){
        text = _this.data.value
      }
    })

    recorderManager.onStop(function (res){
      if(_this.data.click == false){
        let text = _this.data.text
        if(text == ""){
          text = _this.data.value
        }
        recorderManager.start(recorderConfig)
      }
      console.log('last')
    })
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})