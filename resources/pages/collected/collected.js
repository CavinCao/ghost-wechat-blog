const util = require('../../utils/util.js');
var Zan = require('../../dist/index');

Page(Object.assign({}, Zan.Dialog, {
  data: {
    posts: [],
    loading: false,
    nodata: false,
    nomore: false,
    showName: '浏览日期：',
    defaultImageUrl: getApp().globalData.defaultImageUrl + getApp().globalData.imageStyle200To200
  },
  onLoad: function (options) {
    var gotoType = options.gotoType;
    var content = '';
    var isShowContent = wx.getStorageSync('isShowContent_' + gotoType);
    if (gotoType == 'recent') {
      wx.setNavigationBarTitle({
        title: '最近浏览'
      })
      this.setData({
        showName: '浏览日期：'
      });
      content = '容量有限，只能展示最近30条浏览记录哟';
      this.getData(gotoType);
    }
    else {
      wx.setNavigationBarTitle({
        title: '我的收藏'
      })
      this.setData({
        showName: '收藏日期：'
      });
      content = '容量有限，只能展示最近30条收藏记录哟';
      this.getData(gotoType);
    }
    if (isShowContent!=1) {
      this.showZanDialog({
        title: '友情提示',
        content: content,
        buttons: [{
          text: '确定',
          color: '#3CC51F',
          type: 'submit'
        }, {
          text: '不再提示',
          type: 'cancel'
        }]
      }).then(({ type }) => {
        if (type == 'cancel') {
          wx.setStorageSync('isShowContent_' + gotoType, 1);
        }
      });
    }
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
      posts[index].imageUrl = this.data.defaultImageUrl
      this.setData({
        posts: posts
      })
    }
  },
  getData: function (gotoType) {
    let that = this;
    var postsRecent = gotoType == 'recent' ? wx.getStorageSync('posts_Recent') : wx.getStorageSync('posts_CollectedDetail');
    if (postsRecent) {
      var posts = [];
      if (Object.getOwnPropertyNames(postsRecent).length > 0) {
        for (var item in postsRecent) {
          var post = {};
          post['id'] = item;
          post['title'] = postsRecent[item]['title'];
          post['imageUrl'] = postsRecent[item]['imageUrl'];
          post['created_at'] = postsRecent[item]['time'];
          posts.push(post);
        }
        that.setData({
          posts: posts.reverse(),
          nodata: false,
          nomore: true
        })
      }
      else {
        that.setData({
          nodata: true,
          nomore: false
        })
      }
    }
    else {
      that.setData({
        nodata: true,
        nomore: false
      })
    }
  }
}));
