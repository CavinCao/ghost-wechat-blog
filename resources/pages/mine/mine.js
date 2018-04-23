//index.js
//获取应用实例
const app = getApp()

Page({
  data: {
    userInfo: {}
  },
  //事件处理函数
  bindViewTap: function () {
    wx.navigateTo({
      url: '../logs/logs'
    })
  },
  onLoad: function () {
    let that = this;
    app.getUserInfo(1, function (userInfo, isLogin) {
      if (!isLogin) {
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
      else {
        that.setData({
          userInfo: userInfo
        });
      }
    });  
  }
})
