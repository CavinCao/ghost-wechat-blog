const apiURL = 'https://www.bug2048.com/ghost/api/v0.1';
const clientId = 'ghost-frontend';
const clientSecret = 'ed4c807905b8';

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

const getBlogList = (params) => {
  wxRequest(params, `${apiURL}/posts?page=${params.query.page}&limit=${params.query.limit}&client_id=ghost-frontend&client_secret=ed4c807905b8&fields=${params.query.fields}`);
};

const getBlogById = (params) => {
  wxRequest(params, `${apiURL}/posts/${params.query.blogId}?client_id=${clientId}&client_secret=${clientSecret}`);
};

const getBlogByTag = (params) => {
  wxRequest(params, `${apiURL}/posts?page=${params.query.page}&limit=${params.query.limit}&client_id=${clientId}&client_secret=${clientSecret}&filter=${params.query.filter}`);
};

module.exports = {
  getBlogList,
  getBlogById,
  getBlogByTag
};
