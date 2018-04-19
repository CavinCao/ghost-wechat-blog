/**
  待解决：
  1. 文章标题、首图、标签还未展示
  2. wxParse代码部分没有换行
  3. wxParse图片没有居中且自适应
  4. wxParse样式不是很好看看能不能优化
  5. 详情页底部设计，评论怎么接（ghost目前没有支持评论）
 **/

const WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');

Page({

  /**
   * 页面的初始数据
   */
  data: {
    posts: [],
    article:''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    let blogId = options.blogId;
    that.getData(blogId);
    
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

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
  
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
  
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
  
  },
  getData: function (blogId) {
    let that = this;
    let page = that.data.page;

    api.getBlogById({
      query: {
        blogId: blogId
      },
      success: (res) => {
        this.setData({
          posts: res.data.posts[0],
          article: res.data.posts[0].html
        });
        WxParse.wxParse('article', 'html', res.data.posts[0].html, that, 5);
      },
    });
  }
})