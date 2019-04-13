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
    toOpenId: "",
    commentId: "",
    menuBackgroup: false,
    loading: false,
    nodata: false,
    nomore: false,
    nodata_str: "暂无评论，赶紧抢沙发吧",
    showPopup: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    showPosterPopup: false,
    showPosterImage: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    // 1.授权验证
    app.checkUserInfo(function (userInfo, isLogin) {
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
    wxApi.upsertPostsStatistics([blogId, 1, 0, 0]).then(res => { })
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
  onReachBottom: function () {
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
  formSubmit: function (e) {

    wx.showLoading({
      title: '评论提交中',
    })

    var that = this
    var comment = e.detail.value.inputComment;
    
    //优先保存formId
    console.info(e.detail.formId)
    if (e.detail != undefined && e.detail.formId != undefined) {
      var data = {
        formId: e.detail.formId,
        author: 0,
        timestamp: new Date().getTime()
      }
      wxApi.insertFormIds(data).then(res => {
        console.info(res)
      })
    }

    if (comment == undefined || comment.length == 0) {
      wx.hideLoading()
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
        wx.hideLoading()
        that.showZanToast('评论已提交');
        return wxApi.upsertPostsStatistics([that.data.post.id, 0, 1, 0])
      }).then(res => {

        //通知作者
        var noticeData={
          action:"sendTemplateMessage",
          nickName:app.globalData.userInfo.nickName,
          message:comment,
          blogId:that.data.post.id,
          tOpenId:""
        }
        wxApi.push_notice(noticeData).then(res=>{console.info(res)})

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
        timestamp: new Date().getTime(), //new Date(),
        createDate: util.formatTime(new Date()),
        comment: comment,
        tNickName: toName,
        tOpenId: toOpenId,
        flag: 0
      }]
      console.info(commentId)
      console.info(childData)
      wxApi.pushChildrenCommonts(commentId, childData).then(res => {
        console.info(res)
        wx.hideLoading()
        that.showZanToast('评论已提交');
        return wxApi.upsertPostsStatistics([that.data.post.id, 0, 1, 0])
      }).then(res => {

        var noticeData={
          action:"sendTemplateMessage",
          nickName:app.globalData.userInfo.nickName,
          message:comment,
          blogId:that.data.post.id,
          tOpenId:toOpenId
        }
        console.info(noticeData)
        wxApi.push_notice(noticeData).then(res=>{console.info(res)})

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
  focusComment: function (e) {
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
  onRepleyFocus: function (e) {
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
  onReplyBlur: function (e) {
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
  onShareAppMessage: function () {
    return {
      title: this.data.post.title,
      path: '/pages/detail/detail?blogId=' + this.data.post.id
    }
  },
  /**
   * 图片加载失败给到默认图片
   */
  errorloadImage: function (e) {
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
  navigateBack: function (e) {
    wx.switchTab({
      url: '../index/index'
    })
  },
  /**
   * 收藏
   */
  collection: function (e) {
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
  bulidImage: function (e) {
    /**this.showZanDialog({
      content: '程序员有点懒，该功能还未开发'
    }).then(() => {
      console.log('=== shoe reward ===', 'type: confirm');
    }).catch(() => {
      console.log('=== dialog ===', 'type: cancel');
    });**/

    var that = this
    that.showHideMenu()

    var defaultImageUrl = ""
    var qrcodeUrl = ""

    if (that.data.showPosterImage === "") {

      wx.showLoading({
        title: "正在生成海报",
        mask: true,
      });

      wxApi.getImageInfo(api.getdownloadFileURL(that.data.slug))
        .then(res => {
          console.info(res.path)
          defaultImageUrl = res.path
          return wxApi.getCloudFile('xiaochengxu.jpg')
        }).then(res => {
          console.info(res)
          qrcodeUrl = res.tempFilePath

          that.createPosterWithCanvas(defaultImageUrl, qrcodeUrl, that.data.post.title, that.data.post.custom_excerpt)
        }).catch(res => {
          //首图不存在，给默认图片
          console.info(res)
          wxApi.getImageInfo(api.getdownloadFileURL('blogdefault.jpeg'))
            .then(res => {
              console.info(res.path)
              defaultImageUrl = res.path
              return wxApi.getCloudFile('xiaochengxu.jpg')
            }).then(res => {
              console.info(res)
              qrcodeUrl = res.tempFilePath

              that.createPosterWithCanvas(defaultImageUrl, qrcodeUrl, that.data.post.title, that.data.post.custom_excerpt)
            })

        })
    } else {
      that.setData({
        showPosterPopup: true
      })
    }

  },
  /**
   *  喜欢按钮操作
   */
  clickLike: function (e) {
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
      wxApi.upsertPostsStatistics([that.data.post.id, 0, 0, 1]).then(res => { })
    }
  },
  /**
   * 打赏
   */
  reward: function (e) {
    this.showZanDialog({
      content: '您的分享与关注是对我最大的打赏！'
    }).then(() => {
      console.log('=== shoe reward ===', 'type: confirm');
    });
  },
  /**
   * 获取文章数据
   */
  getData: function (blogId) {
    let that = this;
    var query = {
      blogId: blogId
    }
    var getPostsRequest = wxRequest.getRequest(api.getBlogById(query));
    getPostsRequest.then(res => {


      const post = res.data.posts[0];
      var slug = post.slug + '.jpg'
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
          post: post,
          slug: slug
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
  getPostsCollected: function (blogId) {
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
  getPostsLiked: function (blogId) {
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
  operatePostsRecent: function (post, recentUrl) {
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
  showHideMenu: function () {
    this.setData({
      isShow: !this.data.isShow,
      isLoad: false,
      menuBackgroup: !this.data.false
    })
  },
  /**
   * 非评论区隐藏菜单
   */
  hiddenMenubox: function () {
    this.setData({
      isShow: false,
      menuBackgroup: false
    })
  },

  /**
   * 授权登录
   */
  bindGetUserInfo: function (e) {
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
  },

  /**
   * 利用画布生成海报
   */
  createPosterWithCanvas: function (postImageLocal, qrcodeLoal, title, custom_excerpt) {
    var that = this;

    var context = wx.createCanvasContext('mycanvas');
    context.setFillStyle('#ffffff');
    context.fillRect(0, 0, 600, 970);
    context.drawImage(postImageLocal, 0, 0, 600, 300); //绘制首图
    context.drawImage(qrcodeLoal, 210, 650, 180, 180); //绘制二维码
    context.setFillStyle("#000000");
    context.setFontSize(20);
    context.setTextAlign('center');
    context.fillText("阅读文章,请长按识别二维码", 300, 895);
    context.setFillStyle("#000000");
    context.beginPath() //分割线
    context.moveTo(30, 620)
    context.lineTo(570, 620)
    context.stroke();
    context.setTextAlign('left');
    context.setFontSize(40);

    if (title.lengh <= 12) {
      context.fillText(title, 40, 360);
    } else {
      context.fillText(title.substring(0, 12), 40, 360);
      context.fillText(title.substring(12, 26), 40, 410);
    }

    context.setFontSize(20);
    if (custom_excerpt.lengh <= 26) {
      context.fillText(custom_excerpt, 40, 470);
    } else {
      context.fillText(custom_excerpt.substring(0, 26), 40, 470);
      context.fillText(custom_excerpt.substring(26, 50) + '...', 40, 510);
    }

    context.draw();

    setTimeout(function () {
      wx.canvasToTempFilePath({
        canvasId: 'mycanvas',
        success: function (res) {
          var tempFilePath = res.tempFilePath;
          wx.hideLoading();
          console.log("海报图片路径：" + res.tempFilePath);
          that.setData({
            showPosterPopup: true,
            showPosterImage: res.tempFilePath
          })
        },
        fail: function (res) {
          console.log(res);
        }
      });
    }, 900);
  },

  /**
   * 取消保存海报图片
   */
  cacenlPosterImage: function () {
    this.setData({
      showPosterPopup: false
    })
  },
  /**
   * 保存海报图片
   */
  savePosterImage: function () {
    let that = this
    wx.saveImageToPhotosAlbum({
      filePath: that.data.showPosterImage,
      success(result) {
        console.log(result)
        wx.showModal({
          title: '提示',
          content: '二维码海报已存入手机相册，赶快分享到朋友圈吧',
          showCancel: false,
          success: function (res) {
            that.setData({
              showPosterPopup: false
            })
          }
        })
      },
      fail: function (err) {
        console.log(err);
        if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
          console.log("再次发起授权");
          wx.showModal({
            title: '用户未授权',
            content: '如需保存海报图片到相册，需获取授权.是否在授权管理中选中“保存到相册”?',
            showCancel: true,
            success: function (res) {
              if (res.confirm) {
                console.log('用户点击确定')
                wx.openSetting({
                  success: function success(res) {
                    console.log('打开设置', res.authSetting);
                    wx.openSetting({
                      success(settingdata) {
                        console.log(settingdata)
                        if (settingdata.authSetting['scope.writePhotosAlbum']) {
                          console.log('获取保存到相册权限成功');
                        } else {
                          console.log('获取保存到相册权限失败');
                        }
                      }
                    })

                  }
                });
              }
            }
          })
        }
      }
    });
  },
  posterImageClick: function (e) {
    wx.previewImage({
      urls: [this.data.showPosterImage],
    });
  },
}));