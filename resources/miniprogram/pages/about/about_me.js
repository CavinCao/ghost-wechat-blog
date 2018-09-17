
Page({

  /**
   * 页面的初始数据
   */
  data: {
    email:'cavincao2005@163.com',
    wechat:'bug生活2048',
    selfwechat:'wuxinxiake123',
    github:'https://github.com/CavinCao',
    weibo:'https://www.weibo.com/bug2048'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  
  },
  copyDataTap:function(e){
    var data = e.target.dataset.index
    wx.setClipboardData({
      data: data,
      success: function (res) {
        wx.getClipboardData({
          success: function (res) {
            console.log(res.data) 
          }
        })
      }
    })
  }
})