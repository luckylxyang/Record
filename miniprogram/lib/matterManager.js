/**获取自己的事项 */
export function getMattersList(success,fail,complete){
  const db = wx.cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    let userId = wx.getStorageSync('userId')
    matters.where({
      userId: userId
    }).get({
      success(res) {
        if (res.data) {
          success(res.data);
        }
      },
      fail(res){
        fail(res)
      },
      complete(res) {
        complete(res)
      }
    })
}

/**添加自己的事项 */
export function addMatter(matter,success,fail){
    const db = wx.cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    let userId = wx.getStorageSync('userId')
    matters.where({
      userId: userId
    }).get({
      success(res) {
        if (res.data) {
          success(res.data);
        }
      },
      fail(res){
        fail(res)
      },
      complete(res) {
        wx.hideLoading()
      }
    })
}

/**删除自己的事项 */
export function deleteMattersById(args,success,fail){
  const db = wx.cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    let userId = wx.getStorageSync('userId')
    let self = this;
    wx.showLoading({
      title: '删除中',
    })
    matters.doc({
      _id:args
    }).remove({
      success(res) {
        if (res.data) {
          success(res.data);
        }
      },
      fail(res){
        fail(res.data)
      },
      complete(res) {
        console.log(res);
        wx.hideLoading()
      }
    })
}