// pages/authorization/authorization.js
var Zan = require('../../dist/index');
const app = getApp();
Page(Object.assign({}, Zan.TopTips, {

  /**
   * 页面的初始数据
   */
  data: {
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    backType: 'index' //index:返回首页 mine:返回用户中心 other 返回此id的文章明细
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      backType: options.backType
    })
    // 查看是否授权
    /*wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              app.globalData.userInfo = res.userInfo
            }
          })
        }
      }
    })*/
  },

  bindGetUserInfo: function(e) {
    let backtype = this.data.backType;
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      if (backtype =='index') {
        wx.switchTab({
          url: '../index/index'
        })
      } else if (backtype == 'mine') {
        wx.switchTab({
          url: '../mine/mine'
        })
      } else {
        wx.redirectTo({
          url: '../detail/detail?blogId=' + backtype
        })
      }
    } else {
      this.showZanTopTips('很遗憾，您拒绝了微信授权，宝宝很伤心');
    }
  },

  //返回首页 
  navigateBack: function(e) {
    wx.switchTab({
      url: '../index/index'
    })
  }
}));