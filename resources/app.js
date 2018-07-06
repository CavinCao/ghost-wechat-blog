//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  checkUserInfo:function(cb){
    let that = this
    if (that.globalData.userInfo)
    {
      typeof cb == "function" && cb(that.globalData.userInfo, true);
    }
    wx.getSetting({
      success: function (res) {
        if (res.authSetting['scope.userInfo']) {
          // 已经授权，可以直接调用 getUserInfo 获取头像昵称
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = JSON.parse(res.rawData);
              typeof cb == "function" && cb(that.globalData.userInfo, true);
            }
          })
        }
        else
        {
          typeof cb == "function" && cb(that.globalData.userInfo, false);
        }
      }
    })
  },
  globalData: {
    userInfo: null,
    //默认图片
    defaultImageUrl: 'http://image.bug2048.com/blogdefault.jpeg?',
    imageUrl: 'http://image.bug2048.com/',
    imageStyle200To200: 'imageView2/1/w/200/h/200/q/100',
    imageStyle600To300: 'imageView2/1/w/600/h/300/q/75|watermark/2/text/QnVn55Sf5rS7MjA0OA==/font/5a6L5L2T/fontsize/280/fill/IzAwMDAwMA==/dissolve/100/gravity/SouthEast/dx/10/dy/10'
  }
})