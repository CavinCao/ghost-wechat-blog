/**
  待解决：
  1. 【解决】文章标题、首图、标签还未展示
  2. wxParse代码部分没有换行
  3. wxParse图片没有居中且自适应
  4. wxParse样式不是很好看看能不能优化
  5. 【解决】详情页底部设计，评论怎么接（ghost目前没有支持评论）
 **/

const Zan = require('../../dist/index');
const WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');

Page(Object.assign({}, Zan.Dialog, Zan.Toast, {

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

    //收藏状态
    var postsCollected = wx.getStorageSync('posts_Collected');
    if (postsCollected) {
      var isCollected = postsCollected[blogId];
      this.setData({
        collected: isCollected
      })
    }
    else {
      var postsCollected = {}
      postsCollected[blogId] = false;
      wx.setStorageSync('posts_Collected', postsCollected);
    } 
  },
  onShareAppMessage: function () {
    return {
      title: this.data.post.title,
      path: '/pages/detail/detail?blogId=' + this.data.post.id
    }
  },
  //图片加载失败给到默认图片
  errorloadImage: function (e) {
    if (e.type == "error") {
      var post = this.data.post
      post.slug = this.data.defaultImageUrl
      this.setData({
        post: post
      })
    }
  },
  //返回上一页  
  navigateBack: function(e){
    wx.navigateBack(); 
  },
  //收藏
  collection:function(e){
    var postsCollected = wx.getStorageSync('posts_Collected');
    var postCollected = postsCollected[this.data.post.id];
    postCollected = !postCollected;
    postsCollected[this.data.post.id] = postCollected;
    wx.setStorageSync('posts_Collected', postsCollected);
    this.showZanToast(postCollected?'已收藏':'已取消收藏');
    this.setData({
      collected: postCollected
    })
  },
  //打赏
  reward:function(e){
    this.showZanDialog({
      content: '您的分享与关注是对我最大的打赏！'
    }).then(() => {
      console.log('=== shoe reward ===', 'type: confirm');
    });
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
}));