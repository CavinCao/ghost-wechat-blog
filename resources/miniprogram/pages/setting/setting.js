const wxApi = require('../../utils/wxApi.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    formIds: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

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

  formSubmit: function(e) {
    let that = this;
    if (e.detail != undefined && e.detail.formId != undefined) {
      that.setData({
        formIds: that.data.formIds.concat(e.detail.formId)
      })
      console.info(that.data.formIds)
    }
  },
  uploadFormId: function(e) {
    let that = this;
    setTimeout(function () {
      var formIds = that.data.formIds;
      console.info(formIds)
      for (var formId of formIds) {
        var data = {
          formId: formId,
          author: 1,
          timestamp: new Date().getTime()
        }
        wxApi.insertFormIds(data).then(res => {
          console.info(res)
        })
      }
    }, 1000)
  }

})