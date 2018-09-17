/**
  待解决：
  1. Ghost API tag筛选后，fields无法使用，返回的结果集有点多，影响效率
  2. [完成]目前图片是写死的，需要结合七牛云做替换
  3. 作者目前没有很好的办法获取，暂时写死
  4. [完成]下拉，暂无数据，数据加载等动画交互需要实现
  5. api获取数据失败校验和处理
 **/

const { Tab, extend } = require('../../dist/index');
const util = require('../../utils/util.js');
const api = require('../../utils/api.js');

Page(extend({}, Tab, {
  data: {
    navTab: {
      list: [{
        id: 'hot',
        title: '热门'
      }, {
        id: 'java',
        title: 'Java'
      }, {
        id: 'net',
        title: '.Net'
      }, {
        id: 'python',
        title: 'Python'
      }, {
        id: 'other',
        title: '其他'
      }],
      selectedId: 'hot',
      scroll: true,
      height: 45,
    },
    autoplay: true,
    interval: 5000,
    duration: 1000,
    posts: [],
    page: 0,
    loading: false,
    nodata: false,
    nomore: false,
    scrollTop:0,
    lowerComplete:true,
    defaultImageUrl: getApp().globalData.defaultImageUrl + getApp().globalData.imageStyle200To200
  },
  handleZanTabChange(e) {
    var componentId = e.componentId;
    var selectedId = e.selectedId;
    this.setData({
      page: 0,
      nomore: false,
      nodata: false,
      scrollTop:0,
      [`${componentId}.selectedId`]: selectedId
    });
    this.getData(0);
  },
  onLoad: function () {
    console.log('onLoad')
    this.getData(0);
  },
  lower: function () {
    let that = this;
    if (!that.data.lowerComplete)
    {
      return;
    }
    if (!that.data.nomore && !that.data.nodata) {
      that.setData({
        loading: true,
        lowerComplete:false
      });
      that.getData(1);
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

  getData: function (index) {
    let that = this;
    let page = that.data.page;
    let selectId = that.data.navTab.selectedId;
    let filter = '';
    switch (selectId) {
      case 'hot':
        filter = "featured:true";
        break;
      case 'java':
        filter = "tags:['java']";
        break;
      case 'net':
        filter = "tags:['c']";
        break;
      case 'python':
        filter = "tags:['python']";
        break;
      case 'python':
        filter = "tags:['python']";
        break;
      case 'other':
        filter = "page:false";
        break;
      default:
        filter = 'page:false';
    }

    api.getBlogByTag({
      query: {
        limit: 10,
        page: page + 1,
        filter: filter
      },
      success: (res) => {
        console.log(res);
        if (res.data.meta.pagination.next == null) {
          that.setData({
            nomore: true
          });
        }

        const posts = res.data.posts;
        if (posts.length == 0 && index == 0) {
          this.setData({
            posts: index == 1 ? this.data.posts.concat(posts) : posts,
            page: res.data.meta.pagination.page,
            loading: false,
            nomore:false,
            nodata:true
          });
        }
        else {
          for (var post of posts) {
            var time = util.formatTime(post.created_at);
            post.created_at = time;
            post.slug = getApp().globalData.imageUrl + post.slug + '.jpg?' + getApp().globalData.imageStyle200To200;
            console.log(post.slug)
          }
          this.setData({
            posts: index == 1 ? this.data.posts.concat(posts) : posts,
            page: res.data.meta.pagination.page,
            loading: false
          });
        }
      }
    });
  }
}));
