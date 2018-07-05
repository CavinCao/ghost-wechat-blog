/**
  待解决：
  1. 【解决】图片自适应，图片地址转换
 **/

const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
const app = getApp();
var page = 0;
Page({
  data: {
    posts: [],
    page: 0,
    loading: false,
    nodata: false,
    nomore: false,
    lowerComplete: true,
    defaultImageUrl: app.globalData.defaultImageUrl + app.globalData.imageStyle600To300
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    this.getData();

  },
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
    console.log("lower")
  },
  //事件处理函数
  bindItemTap: function (e) {
    let blogId = e.currentTarget.id;
    wx.navigateTo({
      url: '../detail/detail?blogId=' + blogId
    })
  },
  //图片加载失败给到默认图片
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
  getData: function () {
    let that = this;
    let page = that.data.page;
    api.getBlogList({
      query: {
        limit: 10,
        page: page + 1,
        fields: 'id,title,custom_excerpt,created_at,slug'
      },
      success: (res) => {
        if (res.data.meta.pagination.next == null) {
          that.setData({
            nomore: true
          });
        }

        const posts = res.data.posts;
        for (var post of posts) {
          var time = util.formatTime(post.created_at);
          post.created_at = time;
          post.slug = app.globalData.imageUrl + post.slug + '.jpg?' + app.globalData.imageStyle600To300;
        }
        this.setData({
          posts: this.data.posts.concat(posts),
          page: res.data.meta.pagination.page,
          loading:false
        });
      },
    });
  }
})
