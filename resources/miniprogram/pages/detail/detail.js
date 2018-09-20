/**
  待解决：
  1. 【解决】文章标题、首图、标签还未展示
  2. 【解决】wxParse代码部分没有换行
  3. 【解决】wxParse图片没有居中且自适应
  4. wxParse样式不是很好看看能不能优化
  5. 【解决】详情页底部设计，评论怎么接（ghost目前没有支持评论）
 **/

const Zan = require('../../dist/index');
const WxParse = require('../../wxParse/wxParse.js');
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const wxApi = require('../../utils/wxApi.js');
const wxRequest = require('../../utils/wxRequest.js');
const app = getApp();
var recentUrl = '';

Page(Object.assign({}, Zan.Dialog, Zan.Toast, {

  /**
   * 页面的初始数据
   */
  data: {
    post: {},
    author: "",
    iconContact: "",
    iconColock: "",
    collected: false,
    defaultImageUrl: getApp().globalData.defaultImageUrl + getApp().globalData.imageStyle600To300
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    // 1.授权验证
    app.checkUserInfo(function (userInfo, isLogin) {
      if (!isLogin) {
        wx.redirectTo({
          url: '../authorization/authorization?backType=' + blogId
        })
      }
    })
    // 2.默认值初始化
    let that = this;
    let blogId = options.blogId;
    that.setData({
      author: "玄冰",
      iconContact: "contact",
      iconColock: "clock"
    })
    // 3.更新浏览量
    wxApi.upsertPostsStatistics([blogId, 1, 0, 0]).then(res => {})
    // 4.文章详情初始化
    that.getData(blogId);
    // 5.收藏状态初始化
    that.getPostsCollected(blogId);
  },
  /**
   * 分享
   */
  onShareAppMessage: function() {
    return {
      title: this.data.post.title,
      path: '/pages/detail/detail?blogId=' + this.data.post.id
    }
  },
  /**
   * 图片加载失败给到默认图片
   */
  errorloadImage: function(e) {
    if (e.type == "error") {
      var post = this.data.post
      post.slug = this.data.defaultImageUrl
      this.setData({
        post: post
      })
    }
  },
  /**
   * 返回
   */
  navigateBack: function(e) {
    wx.navigateBack();
  },
  /**
   * 收藏
   */
  collection: function(e) {
    let that = this;
    var postsCollected = wx.getStorageSync('posts_Collected');
    var postCollected = postsCollected[that.data.post.id];
    postCollected = !postCollected;
    postsCollected[that.data.post.id] = postCollected;
    wx.setStorageSync('posts_Collected', postsCollected);
    that.showZanToast(postCollected ? '已收藏' : '已取消收藏');
    that.setData({
      collected: postCollected
    })

    //收藏明细
    var postsRecent = wx.getStorageSync('posts_CollectedDetail');
    var content = {};
    content['imageUrl'] = recentUrl;
    content['title'] = that.data.post.title;
    content['time'] = util.formatTime(new Date());
    if (postsRecent) {
      if (postCollected) {
        postsRecent[that.data.post.id] = content;
        if (Object.getOwnPropertyNames(postsRecent).length > 30) {
          for (var item in postsRecent) {
            delete postsRecent[item];
            break
          }
        }
      } else {
        delete postsRecent[that.data.post.id];
      }
      wx.setStorageSync('posts_CollectedDetail', postsRecent);
    } else {
      postsRecent = {};
      postsRecent[that.data.post.id] = content;
      wx.setStorageSync('posts_CollectedDetail', postsRecent);
    }
  },
  /**
   * 打赏
   */
  reward: function(e) {
    this.showZanDialog({
      content: '您的分享与关注是对我最大的打赏！'
    }).then(() => {
      console.log('=== shoe reward ===', 'type: confirm');
    });
  },
  /**
   * 获取文章数据
   */
  getData: function(blogId) {
    let that = this;
    var query = {
      blogId: blogId
    }
    var getPostsRequest = wxRequest.getRequest(api.getBlogById(query));
    getPostsRequest.then(res => {

      const post = res.data.posts[0];
      var time = util.formatTime(post.created_at);
      post.created_at = time;
      recentUrl = getApp().globalData.imageUrl + post.slug + '.jpg?' + getApp().globalData.imageStyle200To200;
      post.slug = getApp().globalData.imageUrl + post.slug + '.jpg?' + getApp().globalData.imageStyle600To300;
      post.view_count = 100;
      post.comment_count = 0;
      post.like_count = 11;

      wxApi.getPostStatistics([post.id]).then(res => {
        if (res.result.length > 0) {
          post.view_count = res.result[0].view_count;
          post.comment_count = res.result[0].comment_count;
          post.like_count = res.result[0].like_count;
        }

        this.setData({
          post: post
        });

      })

      WxParse.wxParse('article', 'html', post.html, that, 5);

      //最近浏览
      that.operatePostsRecent(post, recentUrl)
    });
  },
  /**
   * 获取文章收藏状态
   */
  getPostsCollected: function (blogId){
    let that = this;
    var postsCollected = wx.getStorageSync('posts_Collected');
    if (postsCollected) {
      var isCollected = postsCollected[blogId] == undefined ? false : postsCollected[blogId];
      that.setData({
        collected: isCollected
      })
    } else {
      var postsCollected = {}
      postsCollected[blogId] = false;
      wx.setStorageSync('posts_Collected', postsCollected);
    }
  },

  /**
   * 处理最近浏览
   */
  operatePostsRecent: function (post, recentUrl){
    var postsRecent = wx.getStorageSync('posts_Recent');
    var content = {};
    content['imageUrl'] = recentUrl;
    content['title'] = post.title;
    content['time'] = util.formatTime(new Date());
    if (postsRecent) {
      postsRecent[post.id] = content;
      if (Object.getOwnPropertyNames(postsRecent).length > 30) {
        for (var item in postsRecent) {
          delete postsRecent[item];
          break
        }
      }
      wx.setStorageSync('posts_Recent', postsRecent);
    } else {
      postsRecent = {};
      postsRecent[post.id] = content;
      wx.setStorageSync('posts_Recent', postsRecent);
    }
  }
}));