const cloud = require('wx-server-sdk')

cloud.init();

// 云函数入口函数
exports.main = async (event, context) => {
  console.log(event)
  switch (event.action) {
    case 'addMatter': {
      return addMatter(event)
    }
    case 'getMatters': {
      return getMatters(event)
    }
    case 'deleteMatterById': {
      return deleteMatterById(event)
    }
    case 'updateMatterById': {
      return updateMatterById(event)
    }
    default: {
      return
    }
  }
}

/**添加事项 */
async function getMatters(event) {
    const db = cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    return matters.where({
      data: {
        userId: event.data.userId
      }
    })
}

/**获取事项列表 */
async function addMatter(event) {
  const db = cloud.database('todo-online-lxy')
  const matters = db.collection('matters')
  return matters.add({
    data: {
      userId: event.data.userId,
      matter_name: event.data.matter,
    }
  })
}

/**
 * 根据 id 删除事项
 * @param {*} event 
 */
async function deleteMatterById(event) {
  const db = cloud.database('todo-online-lxy')
  const matters = db.collection('matters')
  return matters.where({
    _id:event.data._id
  }).remove()
}

/**
 * 根据 id 更新事项
 * @param {*} event 
 */
async function updateMatterById(event) {
  const db = cloud.database('todo-online-lxy')
  const matters = db.collection('matters')
  return matters.where({
    _id:event.data._id,
    matter_name:event.data.matter,
  }).update()
}