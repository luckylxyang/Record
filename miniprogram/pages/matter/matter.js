// pages/matter/matter.js
import {getMattersList,deleteMattersById} from '../../lib/matterManager'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    matterArr: [],
    slideButtons: [{ text: '删除', type: 'warn', }],
    dialogShow:false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    add_matter:'',

  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.queryMyMatters();
  },

  /**
   * 获取自己添加的所有事项
   */
  queryMyMatters() {
    let self = this;
    wx.showLoading({
      title: '获取中',
    })
    getMattersList(success => {
      self.setData({
        matterArr: success,
      })
      wx.hideLoading()
    },fail=>{
      console.log(fail);
      wx.hideLoading()
    }),complete=>{
      wx.hideLoading()
    }
  },

  slideButtonTap(event) {
    console.log(event);
    let self = this;
    wx.showLoading({
      title: '删除中',
    })
    wx.cloud.callFunction({
      name: 'matterManager',
      data: {
        data: {
          _id:event.detail.data._id
        },
        action: 'deleteMatterById'
      },
      success(res) {
        console.log("cloud success", res);
        wx.hideLoading()
        wx.showToast({
          title: '已删除',
          duration: 2000,
          success: function () {
            self.queryMyMatters();
          }
        })
      },
      fail(res) {
        wx.hideLoading()
        wx.showToast({
          icon:'none',
          title: res.data.errorCode + "," + res.data.errorMessage,
          duration: 2000,
        })
      }
    })
  },

 /**
   * 添加打卡事项
   */
  addMyMatters(event) {
    if (event.detail.index === 0) {
      this.setData({ dialogShow: false });
      return
    }
    this.setData({ dialogShow: false });
    wx.showLoading({
      title: '添加中...',
    })
    let self = this;
    wx.cloud.callFunction({
      name: 'checkMsg',
      data: {
        content: self.data.add_matter,
        action: 'checkMsgSecurity'
      },
      success(res) {
        console.log("cloud success", res);
        if (res.result.errCode === 0) {
          self.addMatterToServer();
        }
        if (res.result.errCode === 87014) {
          wx.hideLoading();
          wx.showToast({ title: '内容含有违法违规内容', duration: 2000 })
        }
      },
      fail(res) {
        wx.hideLoading()
        console.log("cloud fail", res);
        wx.showToast({ title: "错误码：" + res.errCode + "," + res.errMsg, duration: 2000,icon:'none' })
      }
    })

  },

  
  bindAddInput(event) {
    this.data.add_matter = event.detail.value
  },

  addMatterToServer() {
    const db = wx.cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    let userId = wx.getStorageSync('userId')
    let self = this;
    matters.add({
      data: {
        userId: userId,
        matter_name: this.data.add_matter,
      },
      success: function (res) {
        wx.showToast({ title: '添加成功', icon: 'success', duration: 2000,
        success: function () {
          self.queryMyMatters();
        } })
      },
      fail: function (err) {
        wx.showToast({
          title: '添加失败', icon: 'none', duration: 2000
        })
      },
      complete: function () {
        wx.hideLoading()
      }

    })
  },

  showAddDialog(event){
    this.setData({dialogShow:true})
  }
})