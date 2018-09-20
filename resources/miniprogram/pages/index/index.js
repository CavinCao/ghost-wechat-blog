const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const wxRequest = require('../../utils/wxRequest.js');
const wxApi = require('../../utils/wxApi.js');
const app = getApp();
var page = 0;
Page({
  /**
   * 初始化数据
   */
  data: {
    posts: [],
    page: 0,
    loading: false,
    nodata: false,
    nomore: false,
    lowerComplete: true,
    defaultImageUrl: app.globalData.defaultImageUrl + app.globalData.imageStyle600To300
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function () {
    var that = this
    this.getData();
  },
  /**
   * 下拉
   */
  lower: function () {
    let that = this;
    if (!that.data.lowerComplete) {
      return;
    }
    if (!that.data.nomore &&!that.data.nodata) {
      that.setData({
        loading: true,
        lowerComplete: false
      });
      that.getData();
      that.setData({
        lowerComplete: true
      });
    }
  },
  /**
   * 点击文章明细
   */
  bindItemTap: function (e) {
    let blogId = e.currentTarget.id;
    wx.navigateTo({
      url: '../detail/detail?blogId=' + blogId
    })
  },
  /**
   * 图片加载失败给到默认图片
   */
  errorloadImage: function (e) {
    if (e.type == "error") {
      var index = e.target.dataset.index
      var posts = this.data.posts
      posts[index].slug = this.data.defaultImageUrl
      this.setData({
        posts: posts
      })
    }
  },
  /**
   * 获取列表信息
   */
  getData: function () {
    let that = this;
    let page = that.data.page;
    var query={
      limit: 10,
      page: page + 1,
      fields: 'id,title,custom_excerpt,created_at,slug'
    }
    var getPostsRequest = wxRequest.getRequest(api.getBlogList(query));
    getPostsRequest.then(res=>{

      if (res.data.meta.pagination.next == null) {
        that.setData({
          nomore: true
        });
      }

      const posts = res.data.posts;
      var postIds = [];
      posts.forEach(function (v) { postIds.push(v.id); });

      wxApi.getPostStatistics(postIds).then(res => {

        for (var post of posts) {
          var time = util.formatTime(post.created_at);
          post.created_at = time;
          post.slug = app.globalData.imageUrl + post.slug + '.jpg?' + app.globalData.imageStyle600To300;
          post.view_count = 100;
          post.comment_count = 0;
          post.like_count = 11;

          for (var item of res.result) {
            if (post.id == item.post_id) {
              post.view_count = item.view_count;
              post.comment_count = item.comment_count;
              post.like_count = item.like_count;
            }
          }
        }

        this.setData({
          posts: this.data.posts.concat(posts),
        });

      })
      
    })
  }
})
