// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()
const _ = db.command

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var result= await db.collection('posts_statistics').where({
      post_id: _.in(event.post_ids)
    }).get(); 
    return result.data 
  }
  catch(e)
  {
    console.error(e)
    return []
  }
}