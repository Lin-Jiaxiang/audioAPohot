// miniprogram/pages/upload/index.js
const app = getApp()
import Dialog from '../../components/dialog/dialog';
import { getTask } from '../api/api'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    list: '',
    taskid: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let _this = this
  },

  getLocalTime: function (ns) {
    //needTime是整数，否则要parseInt转换  
    var time = new Date(parseInt(ns)); //根据情况*1000
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    var h = time.getHours();
    var mm = time.getMinutes();
    var s = time.getSeconds();
    return y + '-' + this.add0(m) + '-' + this.add0(d) + ' ' + this.add0(h) + ':' + this.add0(mm) + ':' + this.add0(s);
  },

  //小于10的补零操作
  add0: function (m) {
    return m < 10 ? '0' + m : m
  },

  getYearMD: function (ns) {
    var allStr = this.getLocalTime(ns);
    var year = allStr.substr(0, 4);
    var month = allStr.substr(5, 2);
    var day = allStr.substr(8, 2);
    return year + '/' + month + '/' + day;
  },

  getTask() {
    let _this = this
    let data = {
      name: app.globalData.openid
    }

    getTask(data).then(response => {
      console.log(response)
      let result = response
      let resultData = result.data
      let taskid = []
      for (let i in resultData) {
        resultData[i].createTime = _this.getYearMD(resultData[i].createTime)
        resultData[i].state = false
        taskid.push(resultData[i].taskid)
      }
      if (result.code == 0) {
        _this.setData({
          list: result.data,
          taskid: taskid
        })
      }
    }).catch(err => {
      console.log(err)
    })

    // wx.request({
    //   url: app.globalData.apiUrl + '/audio/gettask', //仅为示例，并非真实的接口地址
    //   method: 'get',
    //   data: {
    //     name: app.globalData.openid,
    //   },
    //   header: {
    //     'content-type': 'application/json' // 默认值
    //   },
    //   success (res) {
    //     let result = res.data
    //     let resultData = result.data
    //     let taskid = []
    //     for(let i in resultData){
    //       resultData[i].createTime = _this.getYearMD(resultData[i].createTime)
    //       resultData[i].state = false
    //       taskid.push(resultData[i].taskid)
    //     }
    //     if(result.code == 0){
    //       _this.setData({
    //         list: result.data,
    //         taskid: taskid
    //       })
    //       // _this.lookfor()
    //     }
    //   } 
    // }) 
  },

  lookfor() {
    let _this = this
    wx.request({
      url: app.globalData.apiUrl + '/audio/checkTask', //仅为示例，并非真实的接口地址
      method: 'post',
      data: {
        taskid: _this.data.taskid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        let result = res.data
        let resultData = result.data
        console.log(res)
      }
    })
  },

  lookforDetail(e) {
    let _this = this
    let taskid = [e.currentTarget.dataset.taskid]
    // if(state == false){
    //   wx.showToast({title: '解析中，请稍后', icon: 'none'})
    //   return false
    // }
    wx.request({
      url: app.globalData.apiUrl + '/audio/checkTask', //仅为示例，并非真实的接口地址
      method: 'post',
      data: {
        taskid: taskid
      },
      header: {
        'content-type': 'application/json' // 默认值
      },
      success(res) {
        let result = res.data
        if (result.data.tasks_info[0].task_status == 'Success') {
          Dialog.confirm({
            title: '识别内容',
            message: result.data.tasks_info[0].task_result.result[0],
            confirmButtonText: "一键复制"
          })
            .then(() => {
              // on confirm
              _this.setData({
                cameraShow: 'block'
              })
              wx.setClipboardData({
                data: result.data.tasks_info[0].task_result.result[0],
                success: function (res) {
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
        } else {
          wx.showToast({ title: '解析中，请稍后', icon: 'none' })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    this.getTask()
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