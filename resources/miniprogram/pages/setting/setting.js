const wxApi = require('../../utils/wxApi.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formIds:0,
    expireFormIds:0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this
    wxApi.query_formIds().then(res => {
      console.info(res)
      that.setData({
        formIds:res.result.formIds,
        expireFormIds:res.result.expireFromIds
      })
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

  formSubmit: function (e) {
    let that = this;
    wx.showLoading({
      title: '正在提交',
    })
    if (e.detail != undefined && e.detail.formId != undefined && e.detail.formId != "the formId is a mock one") {
      var data = {
        formId: e.detail.formId,
        author: 1,
        timestamp: new Date().getTime()
      }
      wxApi.insertFormIds(data).then(res => {
        console.info(res)
        wx.hideLoading()
      })
    }
  }
})