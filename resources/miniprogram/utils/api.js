const apiURL = 'https://www.bug2048.com/ghost/api/v0.1';
const clientId = 'ghost-frontend';
const clientSecret = 'ed4c807905b8';

const downloadFileURL ='https://bug2048-1253706941.cos.ap-shanghai.myqcloud.com'

const wxRequest = (params, url) => {
  wx.request({
    url,
    method: params.method || 'GET',
    data: params.data || {},
    header: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    success(res) {
      if (params.success) {
        params.success(res);
      }
    },
    fail(res) {
      if (params.fail) {
        params.fail(res);
      }
    },
    complete(res) {
      if (params.complete) {
        params.complete(res);
      }
    },
  });
};

/**
 * 分页获取文章列表url
 */
const getBlogList = (params) => {
  var url= `${apiURL}/posts?page=${params.page}&limit=${params.limit}&client_id=ghost-frontend&client_secret=ed4c807905b8&fields=${params.fields}`;
  return url
};

/**
 * 根据文章Id获取文章信息
 */
const getBlogById = (params) => {
  var url = `${apiURL}/posts/${params.blogId}?client_id=${clientId}&client_secret=${clientSecret}`;
  return url;
};

/**
 * 根据标签获取文章信息
 */
const getBlogByTag = (params) => {
  wxRequest(params, `${apiURL}/posts?page=${params.query.page}&limit=${params.query.limit}&client_id=${clientId}&client_secret=${clientSecret}&filter=${params.query.filter}`);
};

/**
 * 下载头图文件
 */
const getdownloadFileURL = (name) => {
  var url = `${downloadFileURL}/${name}`
  return url
};

module.exports = {
  getBlogList,
  getBlogById,
  getBlogByTag,
  getdownloadFileURL
};
