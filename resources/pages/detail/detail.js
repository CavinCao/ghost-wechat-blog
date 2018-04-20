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
    post: {},
    defaultImageUrl: getApp().globalData.defaultImageUrl + getApp().globalData.imageStyle600To300
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that=this;
    let blogId = options.blogId;
    that.getData(blogId);    
  },
  //图片加载失败给到默认图片
  errorloadImage: function (e) {
    if (e.type == "error") {
      var post = this.data.post
      posts.slug = this.data.defaultImageUrl
      this.setData({
        post: post
      })
    }
  },
  getData: function (blogId) {
    let that = this;
    api.getBlogById({
      query: {
        blogId: blogId
      },
      success: (res) => {
        const post = res.data.posts[0];
        var time = util.formatTime(post.created_at);
        post.created_at = time;
        post.slug = getApp().globalData.imageUrl + post.slug + '.jpg?' + getApp().globalData.imageStyle600To300;
        
        this.setData({
          post: post
        });
        WxParse.wxParse('article', 'html', post.html, that, 5);
      },
    });
  }
})