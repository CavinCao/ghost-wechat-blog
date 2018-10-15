// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()

const db = cloud.database()

const fs = require('fs')

const request = require('request');

const rp = require('request-promise')

const tokenUrl ='https://api.weixin.qq.com/cgi-bin/token'

const wxcodeUrl ='https://api.weixin.qq.com/wxa/getwxacode'

// 云函数入口函数
exports.main = async (event, context) => {

  var res = await getToken()
  
  console.info(res)
  res = JSON.parse(res)
  console.info(res.access_token)

  var url = `${wxcodeUrl}?access_token=${res.access_token}`
  console.info(url)
  request({
    method: "POST",
    url: url,
    headers: {
      "content-type": "application/json"
    },
    body: {
      path: 'pages/index/index',
      width: 300
    },
    json: true
  }, function (error, response, body) {
    console.log('1------:' + body);
    console.log('2------:' + response);
    console.log(error)
    /*cloud.uploadFile({
      cloudPath: 'demo111.png',
      fileContent: body
    })*/
  })

 // return ""
  
  //const fileStream = wxacode.pipe("demo.jpg")
  /*return await cloud.uploadFile({
    cloudPath: 'demo.png',
    fileContent: wxacode,
  })*/


  //return res
  /*return new Promise((resolve, reject) => {
    request.get(url, (error, response, body) => {
      if (error || response.statusCode !== 200) {
        reject(error)
      } else {
        try {
          console.info(body)
          resolve(body)
        } catch (e) {
          reject(e)
        }
      }
    })
  })*/
}

/**
 * 获取token
 */
async function getToken() {

  var config = await db.collection('posts_config').doc('W7ye4QIrVDZJFskA').get();
  appId = config.data['appId']
  appSecret = config.data['appSecret']

  var url = `${tokenUrl}?grant_type=client_credential&appid=${appId}&secret=${appSecret}`

  return rp(url)
}

/**
 * 获取二维码
 */
async function getWxacode(access_token){
  var url = `${wxcodeUrl}?access_token=${access_token}`
  console.info(url)
  var options = {
    method: 'POST',
    json: true,
    uri: url,
    body: {
      path: 'pages/index/index',
      width: 300
    }
  }

  return rp(options).then(res=>{
    console.info("1------:"+res)
    console.info("2------:" +res.statusCode)
    console.info("3------:" +res.body)
  })
}

/**
 * 获取二维码
 */
function getWxacode1(access_token) {
  var url = `${wxcodeUrl}?access_token=${access_token}`
  console.info(url)
  request({
    method: "POST",
    url: url,
    headers: {
      "content-type": "application/json"
    },
    body: {
      path: 'pages/index/index',
      width: 300
    },
    json: true 
  }, (error, response, body) => {
    console.log('1------:'+body);
    console.log('2------:'+response);
    cloud.uploadFile({
      cloudPath: 'demo111.png',
      fileContent: body
    })
  })
}