export function checkScope(scopeItem,success,fail){
  wx.getSetting({
    success(res) {
      if (!res.authSetting[scopeItem]) {
        wx.authorize({
          scope: scopeItem,
          success (res) {
            success(res);
          },
          fail(error){
            fail(error)
          }
        })
      }
    },
    complete(res){
      
    }
  })
}

export function getUserid(){
  wx.getSetting({
    success(res) {
      if (res.authSetting['scope.userInfo']) {
        wx.authorize({
          scope: 'scope.userInfo',
          success (res) {
            wx.getUserInfo({
              lang: 'zh_CN',
              success:function(res){
                // console.log(res);
                wx.setStorageSync('userId', res.cloudID)
                let app = getApp()
                app.globalData.loginUserId = res.cloudID
              },
            })
            
          },
          fail(error){
            
          }
        })
      }
    },
    complete(res){
      // console.log("complete",res);
      
    }
  })
}

