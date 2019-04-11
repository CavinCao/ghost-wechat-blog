// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

//收到评论通知
const template = 'HcZHCKUF-nG4gEvnj5f_dLefO1z0bzSgc6XTAj8wrFs'

// 云函数入口函数
exports.main = async (event) => {
  switch (event.action) {
    case 'sendTemplateMessage': {
      return sendTemplateMessage(event)
    }
    case 'checkAuthor': {
      return checkAuthor(event)
    }
    default: break
  }
}

/**
 * 验证
 * @param {} event 
 */
async function checkAuthor(event) {
  if (event.userInfo.openId == process.env.author) {
    return true;
  }
  return false;
}
/**
 * 发送通知消息
 * @param  event 
 */
async function sendTemplateMessage(event) {

  var touser = "";
  var form_id = "";
  if (event.tOpenId == "") {
    var openIdformIds = await db.collection('openid_formids').where({
      author: 1
    }).limit(1).get()
    console.info(openIdformIds)
    if (openIdformIds.code) {
      return;
    }
    if (!openIdformIds.data.length) {
      return;
    }
    touser = openIdformIds.data[0]['_openid']
    form_id = openIdformIds.data[0]['formId']
  }
  else {
    var openIdformIds = await db.collection('openid_formids').where({
      _openid: event.tOpenId
    }).limit(1).get()
    if (openIdformIds.code) {
      return;
    }
    if (!openIdformIds.data.length) {
      return;
    }
    touser = openIdformIds.data[0]['_openid']
    form_id = openIdformIds.data[0]['formId']
  }

  const sendResult = await cloud.openapi.templateMessage.send({
    touser: touser,
    templateId: template,
    formId: form_id,
    page: 'pages/detail/detail?blogId=' + event.blogId,
    data: {
      keyword1: {
        value: event.nickName // keyword1 的值
      },
      keyword2: {
        value: event.message // keyword2 的值
      }
    },
  })

  const removeResult = await db.collection('openid_formids').doc(openIdformIds.data[0]['_id']).remove()

  return sendResult
}