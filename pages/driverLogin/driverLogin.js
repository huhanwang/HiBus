// pages/driverLogin/driverLogin.js
var logStatus = 0;
var ftime = require('../ulity/utils.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    tag: '失败',
    btnTxt: '自动开始',
    driverMsg: '疫情当前，请大家上车扫码！',
    allMsg: '',
    pic_array: [
      { id: 13, name: '今天路况比较拥堵，请大家耐心等待！' },
      { id: 14, name: '谁的手机落车上了，请相互转告' },
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

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this
    that.setData({
      allMsg: ''
    })
    wx.cloud.init();
    that.onQuery()
  },

  onQuery: function() {
    var that = this
    const db = wx.cloud.database()
    // 查询当前用户所有的 counters
    db.collection('msgBoard').orderBy('createTime','desc').where({
      _openid: this.data.openid
    }).get({
      success: res => {
        for(var i=0;i<3;i++){
          that.setData({
            allMsg: that.data.allMsg + res.data[i].count + '\n'
          })
          console.log(that.data.allMsg)
        }
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

  getInput: function (e) {
    this.setData({
      driverMsg: e.detail.value
    })
  },

  uploadUserMsg: function () {
    var that = this
    // 初始化数据库
    const db = wx.cloud.database();
    db.collection('msgBoard').add({
      data: {
        count: '司机 : ' + that.data.pic_array[that.data.hx_index].name + ' ' + ftime.formatTime1((new Date())),
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
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },

  getPosition: function() {
    wx.request({
      url: 'https://yingyan.baidu.com/api/v3/track/getlatestpoint',
      data: {
        ak: '你的ak密钥',
        service_id: 208886,
        entity_name: 'bus01',
        coord_type_output: 'gcj02'
      },
      method: 'GET',
      success(res) {
        console.log(res.data)
      }
    })
  },

  uploadPosition: function() {
    var that = this
    that.setData({
      tag: '失败'
    })
    wx.getLocation({
      type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        var speed = res.speed
        const accuracy = res.accuracy

        if (speed < 0) {
          speed = 0;
        }
        //上传位置
        wx.request({
          url: 'https://yingyan.baidu.com/api/v3/track/addpoint',
          method: 'POST',
          data: {
              ak: '你的ak密钥',
            service_id: 208886,
            entity_name: 'bus01',
            latitude: latitude,
            longitude: longitude,
            loc_time: Math.round(new Date() / 1000),
            coord_type_input: 'gcj02',
            speed: speed * 3.6
          },
          header: {
            'content-type': 'application/x-www-form-urlencoded'
          },
          success(res) {
            console.log(res.data)
            that.setData({
              tag: latitude + ',' + longitude + ',' + speed + ',' + Math.round(new Date() / 1000)
            })
          }
        })
      }
    })
  },

  getTime: function() {

    //var timestamp = Date.parse(new Date());
    var timestamp = Math.round(new Date() / 1000);
    console.log(timestamp)

  },

  autoLog: function() {
    var that = this
    logStatus = ~logStatus;

    if (logStatus) {
      that.setData({
        btnTxt: '结束'
      })
      this.autoUpload();
    }else
    {
      that.setData({
        btnTxt: '重新开始'
      })
    }

  },

  autoUpload: function() {

    var that = this
    //10秒上传一次位置
    setTimeout(function() {
      if (logStatus) that.autoJump();
    }, 10000)

  },


  autoJump:function(){
    
    this.uploadPosition();
    this.autoUpload();

  }


})