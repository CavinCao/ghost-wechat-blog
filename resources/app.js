//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
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