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
    case 'removeExpireFormId': {
      return removeExpireFormId(event)
    }
    case 'queryFormIds': {
      return queryFormIds(event)
    }
    default: break
  }
}

/**
 * 获取总的formIds和过期的formIds
 * @param {} event 
 */
async function queryFormIds(event) {
  var data = {}
  var formIdsResult = await db.collection('openid_formids').where({
    _openid: process.env.author // 填入当前用户 openid
  }).count()

  console.info(formIdsResult)

  console.info(new Date().removeDays(7).getTime())
  var formIdsExpireResult = await db.collection('openid_formids').where({
    _openid: process.env.author, // 填入当前用户 openid
    timestamp: _.lt(new Date().removeDays(7).getTime())
  }).count()

  console.info(formIdsExpireResult)

  data.formIds = formIdsResult.total
  data.expireFromIds = formIdsExpireResult.total
  return data;
}

/**
 * 删除过期的formID
 * @param {} event 
 */
async function removeExpireFormId(event) {
  try {
    return await db.collection('openid_formids').where({
      timestamp: _.lt(new Date().removeDays(7).getTime())
    }).remove()
  } catch (e) {
    console.error(e)
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
  var openId = event.tOpenId == "" ? process.env.author : event.tOpenId

  var openIdformIds = await db.collection('openid_formids').where({
    _openid: openId
  }).limit(1).get()
  if (openIdformIds.code) {
    return;
  }
  if (!openIdformIds.data.length) {
    return;
  }
  touser = openIdformIds.data[0]['_openid']
  form_id = openIdformIds.data[0]['formId']
  console.info("openId:"+touser+";formId:"+form_id)

  const removeResult = await db.collection('openid_formids').doc(openIdformIds.data[0]['_id']).remove()
  console.info(event.nickName + ":" + event.message)

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
  return sendResult
}