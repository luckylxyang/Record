const cloud = require('wx-server-sdk')

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'checkMsgSecurity': {
      return checkMsgSecurity(event)
    }
    case 'sendSubscribeMessage': {
      return sendSubscribeMessage(event)
    }
    case 'getWXACode': {
      return getWXACode(event)
    }
    case 'getOpenData': {
      return getOpenData(event)
    }
    default: {
      return
    }
  }
}

async function checkMsgSecurity(event) {
  console.log("cloud method",event);
  const log = cloud.logger()
  return cloud.openapi.security.msgSecCheck({
    content: event.content,
  })
}