// miniprogram/pages/photo/index.js
import Dialog from '../../components/dialog/dialog';

Page({

  /**
   * 页面的初始数据
   */
  data: {
    active: 1,
    icon:[
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
    cameraShow: 'block',
    photoUrl: ''
  },
  onChange() {
    wx.redirectTo({
      url: '/pages/audio/index',
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  upload(path){
    let _this = this
    wx.showLoading({
      title: '识别中'
    })
    _this.setData({
      cameraShow: 'none'
    })
    let fileName = new Date().getTime()
    wx.cloud.uploadFile({
      cloudPath: 'ocrimages/' + fileName + '.png',
      filePath: path, // 文件路径
      success: res => {
        // get resource ID
        _this.getPath(res.fileID)
      },
      fail: err => {
        // handle error
      }
    })
  },

  getPath(id){
    let _this = this
    wx.cloud.getTempFileURL({
      fileList: [{
        fileID: id,
        maxAge: 60 * 60, // one hour
      }]
    }).then(res => {
      // get temp file URL
      _this.ocr(res.fileList[0].tempFileURL)
    }).catch(error => {
      // handle error
    })
  },

  ocr(path){
    let _this = this
    wx.cloud.callFunction({
      name: 'baiduocr',
      data: {
        file: path
      },
    }).then(res => {
      wx.hideLoading()
      if(res.result.errCode){
        wx.showToast({
          title: '请稍后再试',
          duration: 2000
        })
        return false
      }
      let ocrData = JSON.parse(res.result.data).words_result
      let result = ''
      for(let i in ocrData){
        result += ocrData[i].words + '\n'
      }
      Dialog.confirm({
        title: '识别内容',
        message: result,
        confirmButtonText: "一键复制"
      })
        .then(() => {
          // on confirm
          _this.setData({
            cameraShow: 'block'
          })
          wx.setClipboardData({
            data: result,
            success: function(res) {
              wx.showToast({
                title: '复制成功',
                duration: 1000
              })
            }
          })
        })
        .catch(() => {
          // on cancel
          _this.setData({
            cameraShow: 'block'
          })
        });
    }).catch(err => {
      console.log(err)
    })
  },

  Cphoto: function(e) {
    let _this = this
    wx.chooseImage({
      sizeType: ['original', 'compressed'], //可选择原图或压缩后的图片
      sourceType: ['album'], //可选择性开放访问相册、相机
      count: 1,
      success: res => {
        _this.upload(res.tempFilePaths[0])
        _this.setData({
          photoUrl: res.tempFilePaths[0]
        })
      }
    })
  },

  takePhoto:function () {
    let _this = this
    const ctx = wx.createCameraContext()
    ctx.takePhoto({
      quality: 'high',
      success: (res) => {
        _this.upload(res.tempImagePath)
        _this.setData({
          photoUrl: res.tempImagePath
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    let _this = this
    const query = wx.createSelectorQuery()
    query.select('.class1').boundingClientRect()
    query.exec(function(res){
      _this.setData({
        tabHeight: res[0].height + 'px'
      })
    })
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

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