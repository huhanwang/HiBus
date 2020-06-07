var busData = require('../ulity/bus.js');
var options = ["设为乘车点", "报错"];
var makersData = [];
var calloutData = [];

Page({
  data: {
    city: "班车",
    city1: "站点",
    //车型
    model: "选项",
    qyopen: false,
    qyshow: true,
    isfull: false,

    cityleft: busData.getCity(),
    citycenter: {},
    cityright: [],
    select1: '',
    select2: '',
    shownavindex: '',
    latitude: 31.322957,
    longitude: 121.606561,
    scale: 16,
    markers: [{
      id: 1,
      iconPath: '/images/location.png',
      latitude: 31.322957,
      longitude: 121.606561,
      callout: {
        content: "公司\n上班时间：8:30",
        fontSize: 14,
        color: '#01c1fc',
        bgColor: '#fff',
        padding: 8,
        borderRadius: 10,
        display: "ALWAYS",
        boxShadow: '4px 8px 16px 0 rgba(0)',
        textAlign: 'center'
      }
    }]
  },

  // 生命周期函数--监听页面加载
  onLoad: function() {},

  //选择班车
  listqy: function(e) {
    if (this.data.qyopen) {
      this.setData({
        qyopen: false,
        qyshow: true,
        isfull: false,
        shownavindex: 0
      })
    } else {
      this.setData({
        qyopen: true,
        qyshow: false,
        isfull: true,
        shownavindex: e.currentTarget.dataset.nav
      })
    }

  },
  //选择站点
  list: function(e) {
    if (this.data.nzopen) {
      this.setData({
        qyopen: false,
        qyshow: true,
        isfull: false,
        shownavindex: 0
      })
    } else {
      this.setData({
        content: this.data.nv,
        qyopen: false,
        qyshow: true,
        isfull: true,
        shownavindex: e.currentTarget.dataset.nav
      })
    }
  },
  //选择操作
  listpx: function(e) {
    if (this.data.pxopen) {
      this.setData({
        qyopen: false,
        qyshow: true,
        isfull: false,
        shownavindex: 0
      })
    } else {
      this.setData({
        qyopen: false,
        qyshow: true,
        isfull: true,
        shownavindex: e.currentTarget.dataset.nav
      })
    }
    console.log(e.target)
  },
  selectleft: function(e) {

    this.setData({
      cityright: {},
      citycenter: this.data.cityleft[e.currentTarget.dataset.city],
      city: e.target.dataset.city,
      select1: e.target.dataset.city,
      select2: ''
    });
  },
  selectcenter: function(e) {

    this.setData({
      cityright: options,
      select2: e.target.dataset.city,
      city: e.target.dataset.city
    });
    //地点选择完毕

    this.mapDataUpdate(e.currentTarget.dataset.city);
  },

  selectcity: function(e) {
    console.log(e.target.dataset.city)
  },

  hidebg: function(e) {

    this.setData({
      qyopen: false,
      qyshow: true,
      isfull: false,
      shownavindex: 0
    })
  },

  mapDataUpdate: function(e) {

    var busLoc = this.data.cityleft[this.data.select1][this.data.select2];
    var stime = busLoc[0];
    var lat = parseFloat(busLoc[1]);
    var long = parseFloat(busLoc[2]);

    var calstr = this.data.select2 + "\n到站时间：" + stime;

    this.setData({
      latitude: lat,
      longitude: long,
      scale: 16,
      markers: [{
        id: 0,
        latitude: lat,
        longitude: long,
        callout: {
          content: calstr,
          fontSize: 14,
          color: '#01c1fc',
          bgColor: '#fff',
          padding: 8,
          borderRadius: 10,
          display: "ALWAYS",
          boxShadow: '4px 8px 16px 0 rgba(0)',
          textAlign: 'center'
        }
      }]
    });
  },

  toPosition: function(e) {

    var that = this

    wx.getLocation({
      type: 'gcj02', // 返回可以用于wx.openLocation的经纬度
      success(res) {
        var lat = res.latitude
        var long = res.longitude
        that.setData({
          latitude: lat,
          longitude: long,
        })
      }
    })

  },

  tothere: function(e) {

    var lat = this.data.latitude;
    var long = this.data.longitude;

    wx.openLocation({
      latitude: Number(lat),
      longitude: Number(long),
      scale: 18
    })

  },

  showAllMakers: function(e) {

    var busArray = this.data.cityleft;
    var idnum = 1;
    var that = this;
    for (var values in busArray) {

      var lineArray = busArray[values];

      for (var busPoints in lineArray) {

        var lat = lineArray[busPoints][1];
        var long = lineArray[busPoints][2];

        var makerArry = {
          id: idnum,
          latitude: lat,
          longitude: long
        };

        var str = [values, busPoints];

        calloutData.push(str);
        makersData.push(makerArry);
        idnum++;
      }

    }

    that.setData({
      markers: makersData,
      scale: 11
    })
  },

  showCallout: function(e) {

    if (e.markerId > 1) {

      var that = this
      that.setData({
        select1: calloutData[e.markerId - 1][0],
        select2: calloutData[e.markerId - 1][1]
      })

      that.mapDataUpdate(0);

    }
  }
})