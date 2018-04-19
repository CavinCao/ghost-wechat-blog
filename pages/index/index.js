/**
  待解决：
  1. 图片自适应，图片地址转换
 **/

const util = require('../../utils/util.js');
const api = require('../../utils/api.js');
var page = 0
var app = getApp()
Page({
  data: {
    posts: [],
    page: 0,
    loading: false,
    nodata: false,
    nomore: false,
    defaultImageUrl: getApp().globalData.defaultImageUrl + getApp().globalData.imageStyle600To300
  },
  onLoad: function () {
    console.log('onLoad')
    var that = this
    //调用应用实例的方法获取全局数据
    this.getData();
  },
  lower: function () {
    let that = this;
    if (!that.data.nomore) {
      that.getData();
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
  getData: function () {
    let that = this;
    let page = that.data.page;
    api.getBlogList({
      query: {
        limit: 10,
        page: page + 1,
        fields: 'id,title,custom_excerpt,created_at'
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
        }
        this.setData({
          posts: this.data.posts.concat(posts),
          page: res.data.meta.pagination.page,
        });
      },
    });
  }
})
