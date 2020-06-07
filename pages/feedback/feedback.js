// pages/feedback/feedback.js
var app = getApp()
var ftime = require('../ulity/utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userMsg: '师傅等一下，我就在路口马上来了！',
    allMsg: '',
    counterId: 0,
    pic_array: [
      { id: 13, name: '师傅等一下，我就在路口马上来了！' },
      { id: 14, name: '我的包落车上了，谁有看见嘛？' },
      { id: 15, name: '大家早上好' },
      { id: 16, name: '又是愉快的一天呢' },
      { id: 17, name: '大家加油' },
      { id: 18, name: '不要在班车上吃早餐！' },
      { id: 19, name: '这是谁的钱包？' },
      { id: 20, name: '今天天气不错啊！' }],
     hx_index: 0
  },

  bindPickerChange_hx: function (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value);
    this.setData({   //给变量赋值
    hx_index: e.detail.value,  //每次选择了下拉列表的内容同时修改下标然后修改显示的内容，显示的内容和选择的内容一致
   })
    console.log('自定义值:', this.data.hx_index);
   },

  getInput: function (e) {
    this.setData({
      userMsg: e.detail.value
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this
    that.setData({
      allMsg: ''
    })
    wx.cloud.init();
    that.onQuery()
  },

  onQuery: function () {
    var that = this
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('msgBoard').orderBy('createTime','desc').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        for (var i = 0; i < 6; i++) {
          that.setData({
            allMsg: that.data.allMsg + res.data[i].count + '\n'
          })
        }
        console.log(allMsg)
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '查询记录失败'
        })
        console.error('[数据库] [查询记录] 失败：', err)
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

  },

  uploadMsg: function (e) {
    var that = this
    wx.getUserInfo({
      success: function (res) {
        app.globalData.userInfo = res.userInfo;
        console.log(res.userInfo)
        that.uploadUserMsg()
      }
    })
  },

  uploadUserMsg: function () {
    var that = this
    var upMsg = app.globalData.userInfo.nickName + ' : ' + that.data.pic_array[that.data.hx_index].name + ' ' + ftime.formatTime1((new Date()))
    // 初始化数据库
    const db = wx.cloud.database();
    db.collection('msgBoard').add({
      data: {
        count: upMsg,
        createTime:db.serverDate()
      },
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.setData({
          counterId: res._id
        })
        wx.showToast({
          title: '留言成功！',
        })
        console.log('[数据库] [新增记录] 成功，记录 _id: ', res._id)
        that.onLoad();
      },
      fail: err => {
        wx.showToast({
          icon: 'none',
          title: '留言失败！'
        })
        console.error('[数据库] [新增记录] 失败：', err)
      }
    })
  }

})