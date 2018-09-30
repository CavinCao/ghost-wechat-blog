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
let isFocusing = false;

Page(Object.assign({}, Zan.Toast, Zan.Dialog, {

  /**
   * 页面的初始数据
   */
  data: {
    post: {},
    author: "",
    iconContact: "",
    iconColock: "",
    collected: false,
    liked: false,
    defaultImageUrl: app.globalData.defaultImageUrl + app.globalData.imageStyle600To300,
    isShow: false,
    comments: [],
    commentsPage: 1,
    commentContent: "",
    isLastCommentPage: false,
    placeholder: "评论...",
    focus: false,
    toName: "",
    toOpenId:"",
    commentId: "",
    menuBackgroup: false,
    loading: false,
    nodata: false,
    nomore: false,
    nodata_str:"暂无评论，赶紧抢沙发吧",
    showPopup:false,
    canIUse: wx.canIUse('button.open-type.getUserInfo')
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

    let that = this;
    // 1.授权验证
    app.checkUserInfo(function(userInfo, isLogin) {
      if (!isLogin) {
        /**wx.redirectTo({
          url: '../authorization/authorization?backType=' + blogId
        })**/
        that.setData({
          showPopup: true
        })
        return;
      }
    })
    // 2.默认值初始化
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
    // 6.初始化喜欢状态
    that.getPostsLiked(blogId);
  },
  /**
   * 底部触发加载评论
   */
  onReachBottom: function() {
    var that = this;
    if (that.data.isLastCommentPage) {
      return;
    }
    that.setData({
      loading: true
    })
    wxApi.getPostsCommonts(that.data.post.id, that.data.commentsPage).then(res => {
      console.log(res)
      if (res.data.length > 0) {
        that.setData({
          comments: that.data.comments.concat(res.data),
          commentsPage: that.data.commentsPage + 1,
          loading: false
        })
      } else {
        if (that.data.commentsPage === 1) {
          that.setData({
            isLastCommentPage: true,
            nodata: true,
            loading: false
          })
        } else {
          that.setData({
            isLastCommentPage: true,
            nomore: true,
            loading: false
          })
        }
      }
      console.log(that.data.nodata);
    })


  },
  /**
   * 发送按钮提交
   */
  formSubmit: function(e) {
    var that = this
    var comment = e.detail.value.inputComment;
    if (comment.length === 0) {
      //提示
      return
    }
    var commentId = that.data.commentId
    var toName = that.data.toName
    var toOpenId = that.data.toOpenId
    if (commentId === "") {
      var data = {
        postId: that.data.post.id,
        cNickName: app.globalData.userInfo.nickName,
        cAvatarUrl: app.globalData.userInfo.avatarUrl,
        timestamp: new Date().getTime(),
        createDate: util.formatTime(new Date()),
        comment: comment,
        childComment: [],
        flag: 0
      }
      wxApi.insertPostsCommonts(data).then(res => {
        console.info(res)
        that.showZanToast('评论已提交');
        return wxApi.upsertPostsStatistics([that.data.post.id, 0, 1, 0])
      }).then(res => {

        var post = that.data.post
        post.comment_count = post.comment_count + 1;

        that.setData({
          comments: [],
          commentsPage: 1,
          isLastCommentPage: false,
          toName: "",
          commentId: "",
          placeholder: "评论...",
          commentContent: "",
          post: post,
          loading: true,
          nodata: false,
          nomore: false
        })

        return wxApi.getPostsCommonts(that.data.post.id, that.data.commentsPage)

      }).then(res => {
        if (res.data.length > 0) {
          that.setData({
            comments: that.data.comments.concat(res.data),
            commentsPage: that.data.commentsPage + 1,
            loading: false
          })
        } else {
          that.setData({
            isLastCommentPage: true,
            nomore: true,
            loading: false
          })
        }
      })
    } else {
      var childData = [{
        cOpenId: app.globalData.openid,
        cNickName: app.globalData.userInfo.nickName,
        cAvatarUrl: app.globalData.userInfo.avatarUrl,
        timestamp: new Date().getTime(),//new Date(),
        createDate: util.formatTime(new Date()),
        comment: comment,
        tNickName: toName,
        tOpenId:toOpenId,
        flag: 0
      }]
      console.info(commentId)
      console.info(childData)
      wxApi.pushChildrenCommonts(commentId, childData).then(res => {
        console.info(res)
        that.showZanToast('评论已提交');
        return wxApi.upsertPostsStatistics([that.data.post.id, 0, 1, 0])
      }).then(res => {

        var post = that.data.post
        post.comment_count = post.comment_count + 1;

        that.setData({
          comments: [],
          commentsPage: 1,
          isLastCommentPage: false,
          toName: "",
          commentId: "",
          placeholder: "评论...",
          commentContent: "",
          post: post,
          loading: true,
          nodata: false,
          nomore: false
        })

        return wxApi.getPostsCommonts(that.data.post.id, that.data.commentsPage)

      }).then(res => {
        if (res.data.length > 0) {
          that.setData({
            comments: that.data.comments.concat(res.data),
            commentsPage: that.data.commentsPage + 1,
            loading: false
          })
        } else {
          that.setData({
            isLastCommentPage: true,
            nomore: true,
            loading: false
          })
        }
      })
    }
  },
  /**
   * 点击评论内容回复
   */
  focusComment: function(e) {
    var that = this;
    var name = e.currentTarget.dataset.name;
    var commentId = e.currentTarget.dataset.id;
    var openId = e.currentTarget.dataset.openid;
    isFocusing = true;

    that.setData({
      commentId: commentId,
      placeholder: "回复" + name + ":",
      focus: true,
      toName: name,
      toOpenId: openId
    });
  },
  /**
   * 聚焦时触发
   */
  onRepleyFocus: function(e) {
    var self = this;
    isFocusing = false;
    if (!self.data.focus) {
      self.setData({
        focus: true
      })
    }
  },
  /**
   * 失去焦点时默认给文章评论
   */
  onReplyBlur: function(e) {
    var self = this;
    if (!isFocusing) {
      {
        const text = e.detail.value.trim();
        if (text === '') {
          self.setData({
            commentId: "",
            placeholder: "评论...",
            toName: ""
          });
        }

      }
    }
    console.log(isFocusing);
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
    wx.switchTab({
      url: '../index/index'
    })
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
   * 生成图片海报
   */
  bulidImage: function(e) {
    this.showZanDialog({
      content: '程序员有点懒，该功能还未开发'
    }).then(() => {
      console.log('=== shoe reward ===', 'type: confirm');
    }).catch(() => {
      console.log('=== dialog ===', 'type: cancel');
    });
  },
  /**
   *  喜欢按钮操作
   */
  clickLike: function(e) {
    let that = this
    var postsLiked = wx.getStorageSync('posts_Liked');
    var postLiked = postsLiked[that.data.post.id];
    postLiked = !postLiked;
    postsLiked[that.data.post.id] = postLiked;
    wx.setStorageSync('posts_Liked', postsLiked);
    that.showZanToast(postLiked ? '已喜欢' : '已取消喜欢');
    that.setData({
      liked: postLiked
    })
    if (postLiked) {
      wxApi.upsertPostsStatistics([that.data.post.id, 0, 0, 1]).then(res => {})
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
  getPostsCollected: function(blogId) {
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
   * 获取文章喜欢状态
   */
  getPostsLiked: function(blogId) {
    let that = this;
    var postsLiked = wx.getStorageSync('posts_Liked');
    if (postsLiked) {
      var isLiked = postsLiked[blogId] == undefined ? false : postsLiked[blogId];
      that.setData({
        liked: isLiked
      })
    } else {
      var postsLiked = {}
      postsLiked[blogId] = false;
      wx.setStorageSync('posts_Liked', postsLiked);
    }
  },

  /**
   * 处理最近浏览
   */
  operatePostsRecent: function(post, recentUrl) {
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
  },

  /**
   * 是否显示功能菜单
   */
  showHideMenu: function() {
    this.setData({
      isShow: !this.data.isShow,
      isLoad: false,
      menuBackgroup: !this.data.false
    })
  },
  /**
   * 非评论区隐藏菜单
   */
  hiddenMenubox: function() {
    this.setData({
      isShow: false,
      menuBackgroup: false
    })
  },

  bindGetUserInfo: function (e) {
    console.log(e.detail.userInfo)
    if (e.detail.userInfo) {
      app.globalData.userInfo = e.detail.userInfo
      this.setData({
        showPopup: !this.data.showPopup
      });
    } else {
      wx.switchTab({
        url: '../index/index'
      })
    }
  }
}));