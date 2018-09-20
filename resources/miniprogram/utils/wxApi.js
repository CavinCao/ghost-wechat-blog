
function wxPromisify(fn) {
  return function (obj = {}) {
    return new Promise((resolve, reject) => {
      obj.success = function (res) {
        //成功
        resolve(res)
      }
      obj.fail = function (res) {
        //失败
        reject(res)
      }
      fn(obj)
    })
  }
}

//无论promise对象最后状态如何都会执行
Promise.prototype.finally = function (callback) {
  let P = this.constructor;
  return this.then(
    value => P.resolve(callback()).then(() => value),
    reason => P.resolve(callback()).then(() => { throw reason })
  );
};

/**
 * 获取文章统计数据
 */
function getPostStatistics(post_ids) {
  var callcloudFunction = wxPromisify(wx.cloud.callFunction)
  return callcloudFunction({
    name: 'get_posts_statistics',
    data: {
      post_ids: post_ids
    }
  })
}

/**
 * 修改统计数量
 */
function upsertPostsStatistics(data) {
  var callcloudFunction = wxPromisify(wx.cloud.callFunction)
  return callcloudFunction({
    name: 'upsert_posts_statistics',
    data: {
      post_id: data[0],
      view_count: data[1],
      comment_count: data[2],
      like_count: data[3]
    }
  })
}


module.exports = {
  getPostStatistics: getPostStatistics,
  upsertPostsStatistics: upsertPostsStatistics
}