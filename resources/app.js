//app.js
App({
  onLaunch: function () {
    //调用API从本地缓存中获取数据
    var logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)
  },
  getUserInfo: function (loginType, cb) {
    var that = this
    if (this.globalData.userInfo) {
      typeof cb == "function" && cb(this.globalData.userInfo, true);
    } 
    else {
      //1.调用登录接口
      wx.login({
        success: function () {
          wx.getUserInfo({
            success: function (res) {
              that.globalData.userInfo = res.userInfo;
              typeof cb == "function" && cb(that.globalData.userInfo, true);
            },
            fail: function () {
              //2.第一次登陆不强制授权，直接返回
              if (loginType == 0) {
                typeof cb == "function" && cb(that.globalData.userInfo, false);
              }
              else {
                //3.授权友好提示
                wx.showModal({
                  title: '提示',
                  content: "您还未授权登陆，部分功能将不能使用，是否重新授权？",
                  showCancel: true,
                  cancelText: "否",
                  confirmText: "是",
                  success: function (res) {
                    //4.确认授权调用wx.openSetting
                    if (res.confirm) {
                      if (wx.openSetting) {//当前微信的版本 ，是否支持openSetting
                        wx.openSetting({
                          success: (res) => {
                            if (res.authSetting["scope.userInfo"]) {//如果用户重新同意了授权登录
                              wx.getUserInfo({
                                success: function (res) {
                                  that.globalData.userInfo = res.userInfo;
                                  typeof cb == "function" && cb(that.globalData.userInfo, true);
                                }
                              })
                            } else {//用户还是拒绝
                              typeof cb == "function" && cb(that.globalData.userInfo, false);
                            }
                          },
                          fail: function () {//调用失败，授权登录不成功
                            typeof cb == "function" && cb(that.globalData.userInfo, false);
                          }
                        })
                      } else {
                        typeof cb == "function" && cb(that.globalData.userInfo, false);
                      }
                    }
                    else
                    {
                      typeof cb == "function" && cb(that.globalData.userInfo, false);
                    }
                  }
                })
              }
            }
          })
        }
      })
    }
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