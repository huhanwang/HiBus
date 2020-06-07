// pages/localization/localization.js
var busData = require('../ulity/bus.js');
var ftime = require('../ulity/utils.js');
var busArry = busData.getCity;
var linTmp = [];
var stopNameArry = [];
var toStop = '';
var curPosStr = '';
var toPosStr = '';
var restTime = 0;
var restDis = 0;
var heightRpx = 0;
var loc_speed = 3;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    latitude: 31.322957,
    longitude: 121.606561,
    BusNo: 9,
    BusId: '沪D79537',
    imgSrc: '../../images/refresh.png',
    lineArry: [],
    polyline:[],
    iconMarginTop: 0,
    locTime:'unkown'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.initData();
    busArry = busArry(1);
    linTmp = busArry[this.data.BusNo + '号线'];
    this.busNameShow();
    this.getBusPos();
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
    this.armShake();
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

  initData: function(){
    stopNameArry = [];
  },

  //获取目标公交车的当前位置
  getBusPos: function() {
    var busName = 'bus01';
    this.getPosition(busName);

  },

  getPosition: function(busName) {
    var that = this
    wx.request({
      url: 'https://yingyan.baidu.com/api/v3/track/getlatestpoint',
      data: {
          ak: '你的ak密钥',
        service_id: 208886,
        entity_name: busName,
        coord_type_output: 'gcj02'
      },
      method: 'GET',
      success(res) {
        that.setData({
          latitude: res.data.latest_point.latitude,
          longitude: res.data.latest_point.longitude,
          locTime: ftime.formatTime(res.data.latest_point.loc_time, 'Y/M/D h:m:s')
        })
        loc_speed = res.data.latest_point.speed;
        that.busUpdate();
        //console.log(ftime.formatTime(res.data.latest_point.loc_time, 'Y/M/D h:m:s'));
      
      }
    })
  },

  //事件回调函数
  driving: function (cpos,topos) {
        var _this = this;
        //网络请求设置
        var opt = {
            //WebService请求地址，from为起点坐标，to为终点坐标，开发key为必填
            url: 'https://apis.map.qq.com/ws/direction/v1/driving/',
            data: {
              from: cpos,
              to: topos,
              key: '你的密钥',
              speed: loc_speed
            },
            method: 'GET',
            dataType: 'json',
            //请求成功回调
            success: function (res) {
                var ret = res.data
                if (ret.status != 0) return; //服务异常处理
                var coors = ret.result.routes[0].polyline, pl = [];
                restTime = ret.result.routes[0].duration;
                restDis = ret.result.routes[0].distance/1000;
                //坐标解压（返回的点串坐标，通过前向差分进行压缩）
                var kr = 1000000;
                for (var i = 2; i < coors.length; i++) {
                      coors[i] = Number(coors[i - 2]) + Number(coors[i]) / kr;
                }
                //将解压后的坐标放入点串数组pl中
                for (var i = 0; i < coors.length; i += 2) {
                    pl.push({ latitude: coors[i], longitude: coors[i + 1] })
                }
                //设置polyline属性，将路线显示出来
                _this.setData({
                    polyline: [{
                        points: pl,
                        color: '#0ea2e7',
                        width: 6
                    }]
                })

                _this.mapUpdate();
            }
        };
        wx.request(opt);
        
  },

  armShake: function() {

    var that = this
    setTimeout(function() {
      that.setData({
        imgSrc: '../../images/refresh.png'
      });
      that.armShake1();
    }, 300)
  },

  armShake1: function() {
    var that = this
    setTimeout(function() {
      that.setData({
        imgSrc: '../../images/refresh1.png'
      });
      that.armShake();
    }, 300)
  },

  busNameShow: function() {

    for (var values in linTmp) {


      if (values.substr(-5, 5) == '(上班停)') {

        values = values.substr(0, values.length - 5)

      }

      if (values.substr(-5, 5) != '(下班停)') {
        stopNameArry.push(values);
      }

    }

    var tmpArry = stopNameArry.concat();
    
    this.setData({
      lineArry: tmpArry.reverse()
    })
  },

  busUpdate: function() {

    var disArry = [];

    var latArry = [];
    var longArry = [];
    var drcArry = [];

    var curlat = this.data.latitude;
    var curlong = this.data.longitude;

    stopNameArry = [];

    for (var values in linTmp) {

      //赋值，把数组中的数据去出来，经纬度，以及下一站的判断标志位
      latArry.push(linTmp[values][1]);
      longArry.push(linTmp[values][2]);
      drcArry.push(linTmp[values][3]);
      stopNameArry.push(values);

      var dis = Math.pow(curlat - linTmp[values][1], 2) + Math.pow(curlong - linTmp[values][2], 2);

      disArry.push(dis);
    }

    var minDis = disArry.indexOf(Math.min.apply(null, disArry));
    stopNameArry.push('公司');
    latArry.push(31.322930);
    longArry.push(121.605043);

    var cmpVal = this.nextStopJudge(curlat, curlong, latArry[minDis], longArry[minDis], drcArry[minDis])
    //计算下一个站点名称
    toStop = stopNameArry[minDis + cmpVal];

    //计算右侧巴士icon高度
    heightRpx = Math.round(((1-(minDis + cmpVal+1) / stopNameArry.length)) * 785)-5;
    console.log(heightRpx, stopNameArry.length);

    curPosStr = curlat + ',' + curlong
    toPosStr = latArry[minDis + cmpVal] + ',' + longArry[minDis + cmpVal]
    //路径规划
    this.driving(curPosStr, toPosStr)
    //console.log(curPosStr);
  },

  nextStopJudge: function(clat,clong,stplat,stplong,tag){
    var result = 0;
    //console.log(clat, clong)
    //console.log(stplat, stplong)
    switch (tag){

      case 'N':
        if (clat >= stplat){
          result = 1;
        }
        break;
      case 'S':
        if (clat <= stplat) {
          result = 1;
        }
        break;
      case 'E':
        if (clong <= stplong) {
          result = 1;
        }
        break;
      case 'W':
        if (clong >= stplong) {
          result = 1;
        }
        break;
      default:
        break;
    }

    return result;

  },

  mapUpdate: function() {
    var that = this
    //console.log(restDis, restTime)

    var timeMin = Math.min(10, restTime)

    var tmpMrg = (timeMin / 10) * 50;
    //console.log(tmpMrg)

    that.setData({
      iconMarginTop: heightRpx + tmpMrg,
      markers: [{
        id: 1,
        iconPath: '/images/g8.png',
        latitude: that.data.latitude,
        longitude: that.data.longitude,
        callout: {
          content: '正在前往：' + toStop + '\n' + '距离:' + restDis.toFixed(1) + '公里' + ' 预估时间:'+ restTime + '分钟',
          fontSize: 14,
          color: "#01c1fc",
          bgColor: '#fff',
          padding: 8,
          borderRadius: 10,
          display: "ALWAYS",
          boxShadow: '4px 8px 16px 0 rgba(0)',
          textAlign: 'center'
        }
      }]
    })
  }

})