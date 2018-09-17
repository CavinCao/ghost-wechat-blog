// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

// 云函数入口函数
exports.main = async (event, context) => {
  try {
    var posts = await db.collection('posts_statistics').where({
      post_id:event.post_id
    }).get()

    if (posts.data.length>0) {
      await db.collection('posts_statistics').doc(posts.data[0]['_id']).update({
        data: {
          view_count: posts.data[0]['view_count'] + event.view_count ,//浏览量
          comment_count: posts.data[0]['comment_count']+event.comment_count,//评论数
          like_count: posts.data[0]['like_count'] + event.like_count//点赞数
        }
      })
    }
    else {
      //默认初始化一笔数据
      await db.collection('posts_statistics').add({
        data: {
          post_id: event.post_id,//文章id
          view_count: 100 + Math.floor(Math.random() * 40),//浏览量
          comment_count: 0,//评论数
          like_count: 10 + Math.floor(Math.random() * 40)//点赞数
        }
      })
    }
    return true
  } catch (e) {
    console.error(e)
    return false
  }
}