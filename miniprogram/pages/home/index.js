import { checkScope, getUserid } from '../../lib/login'
import { diffDateOnToday } from '../../lib/utils'

Page({
  data: {
    year: 0,
    month: 0,
    date: ['日', '一', '二', '三', '四', '五', '六'],
    dateArr: [],
    isToday: 0,
    isTodayWeek: false,
    todayIndex: 0,
    matterArr: [],
    dialogShow: false,
    buttons: [{ text: '取消' }, { text: '确定' }],
    add_matter: '',//保存用户添加的事项
    dialogRecordShow: false,
    selected_matters: [],//记录用户打卡勾选的事项
    dialogHistoryShow: false,
    historyButton: [{ text: '确定' }],
    historyArr: [],
  },

  onReady: function () {
  },
  onLoad: function () {
    let today = new Date();
    let year = today.getFullYear();
    let month = today.getMonth() + 1;
    this.dateInit();
    this.getMyRecords(today);
    this.setData({
      year: year,
      month: month,
      isToday: '' + year + month + today.getDate()
    })
  },
  dateInit: function (setYear, setMonth) {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let dateArr = [];                        //需要遍历的日历数组数据
    let arrLen = 0;                            //dateArr的数组长度
    let now = setYear ? new Date(setYear, setMonth) : new Date();
    let year = setYear || now.getFullYear();
    let nextYear = 0;
    let month = setMonth || now.getMonth();                    //没有+1方便后面计算当月总天数
    let nextMonth = (month + 1) > 11 ? 1 : (month + 1);
    let startWeek = new Date(year + ',' + (month + 1) + ',' + 1).getDay();  //目标月1号对应的星期
    let dayNums = new Date(year, nextMonth, 0).getDate();                //获取目标月有多少天
    let obj = {};
    let num = 0;

    if (month + 1 > 11) {
      nextYear = year + 1;
      dayNums = new Date(nextYear, nextMonth, 0).getDate();
    }
    arrLen = startWeek + dayNums;
    for (let i = 0; i < arrLen; i++) {
      if (i >= startWeek) {
        num = i - startWeek + 1;
        obj = {
          isToday: '' + year + (month + 1) + num,
          dateNum: num,
          weight: 5,
          isRecord: false,
          matters:[],
          date: new Date(year, month, num)
        }
      } else {
        obj = {};
      }
      dateArr[i] = obj;
    }
    this.setData({
      dateArr: dateArr
    })

    let nowDate = new Date();
    let nowYear = nowDate.getFullYear();
    let nowMonth = nowDate.getMonth() + 1;
    let nowWeek = nowDate.getDay();
    let getYear = setYear || nowYear;
    let getMonth = setMonth >= 0 ? (setMonth + 1) : nowMonth;

    if (nowYear == getYear && nowMonth == getMonth) {
      this.setData({
        isTodayWeek: true,
        todayIndex: nowWeek
      })
    } else {
      this.setData({
        isTodayWeek: false,
        todayIndex: -1
      })
    }
  },

  lastMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month - 2 < 0 ? this.data.year - 1 : this.data.year;
    let month = this.data.month - 2 < 0 ? 11 : this.data.month - 2;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
    this.getMyRecords(new Date(year,month));
  },

  nextMonth: function () {
    //全部时间的月份都是按0~11基准，显示月份才+1
    let year = this.data.month > 11 ? this.data.year + 1 : this.data.year;
    let month = this.data.month > 11 ? 0 : this.data.month;
    this.setData({
      year: year,
      month: (month + 1)
    })
    this.dateInit(year, month);
    this.getMyRecords(new Date(year,month));
  },

  onRecord: function (event) {
    if (event.detail.index === 0) {
      this.setData({ dialogRecordShow: false })
      return
    }
    wx.showLoading({
      title: '打卡中',
    })
    let self = this
    const db = wx.cloud.database('todo-online-lxy')
    const record = db.collection('record')
    let userId = wx.getStorageSync('userId')
    record.add({
      data: {
        userId: userId,
        record_date: new Date(),
        record_matter: self.data.selected_matters
      },
      success: function (res) {
        wx.showToast({ title: '打卡成功', icon: 'success', duration: 2000 })
        self.getMyRecords(new Date());
      },
      fail: function (error) {
        wx.showToast({
          title: '打卡失败', duration: 2000
        })
      },
      complete: function () {
        self.setData({ dialogRecordShow: false })
        wx.hideLoading();
      }
    })
  },

  checkboxChange(event) {
    this.data.selected_matters = event.detail.value
  },

  /**
   * 获取自己的打卡事项
   * @param {} e 
   */
  getMyMatters: function (e) {
    const db = wx.cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    let userId = wx.getStorageSync('userId')
    let self = this;
    matters.where({
      userId: userId
    }).get({
      success(res) {
        if (res.data) {
          res.data.forEach(item => {
            item.checked = false
          });
          self.setData({
            matterArr: res.data,
            dialogRecordShow: true,
          })
        }
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
        content: this.data.add_matter,
        action: 'checkMsgSecurity'
      },
      success(res) {
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
        wx.showToast({ title: "错误码：" + res.result.errCode + "," + res.result.errMsg, duration: 2000 })
      }
    })

  },

  addMatterToServer() {
    const db = wx.cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    let userId = wx.getStorageSync('userId')
    if (!userId) {
      getUserid();
    }
    matters.add({
      data: {
        userId: userId,
        matter_name: this.data.add_matter,
      },
      success: function (res) {
        wx.showToast({ title: '添加成功', icon: 'success', duration: 2000 })
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

  /**
   * 获取我的打卡记录
   */
  getMyRecords: function (date) {
    const db = wx.cloud.database('todo-online-lxy')
    const record = db.collection('record')
    const _ = db.command
    let userId = wx.getStorageSync('userId')
    let self = this;
    record.where({
      userId: userId,
      record_date: _.and(_.gt(this.getLastMouthDate(date)), _.lt(this.getNextMouthDate(date)))
    })
      .get({
        success(res) {
          for (let i = 0; i < self.data.dateArr.length; i++) {
            let nowDate = self.data.dateArr[i].date;
            if (nowDate === undefined) continue;
            for (let j = 0; j < res.data.length; j++) {
              let recordDate = res.data[j].record_date;
              if (recordDate.getFullYear() === nowDate.getFullYear() &&
                recordDate.getMonth() === nowDate.getMonth() && recordDate.getDate() === nowDate.getDate()) {
                self.data.dateArr[i].isRecord = true;
                self.data.dateArr[i].matters.push(res.data[j].record_matter)
                break;
              }
            }
          }
          self.setData({
            dateArr: self.data.dateArr
          })
        }
      })
  },

  /**
   * 获取给定时间的所在月第一天
   * @param {时间} date 
   */
  getLastMouthDate(date) {
    let d = new Date(date)
    d.setDate(1);
    return d;
  },

  /**
   * 获取给定时间的所在月最后一天
   * @param {*} date 
   */
  getNextMouthDate(date) {
    var currentMonth = date.getMonth();
    var nextMonth = ++currentMonth;
    var nextMonthFirstDay = new Date(date.getFullYear(), nextMonth, 1);
    var oneDay = 1000 * 60 * 60 * 24;
    return new Date(nextMonthFirstDay - oneDay);
  },

  showAddDialog() {
    this.setData({
      dialogShow: true,
      dialogRecordShow: false
    })
  },

  closeAddDialog() {
    this.setData({
      dialogShow: false,
      dialogRecordShow: true
    })
  },

  bindAddInput(event) {
    this.data.add_matter = event.detail.value
  },

  showRecord(event) {
    let item = this.data.dateArr[event.target.dataset.index]
    let diff = diffDateOnToday(item.date);
    if (diff === 0) {
      this.getMyMatters();
      return;
    } else if (diff === -1) {
      // 今天之前的时间，如果已经打卡就显示记录，未打卡则不响应
      if (item.isRecord) {
        this.showHistoryRecordDialog(item);
      }
    } else {
      // 比当天及更晚的时间，不需要响应
    }
  },

  showHistoryRecordDialog(item) {
    console.log(item);
    
    this.setData({ 
      dialogHistoryShow: true,
      historyArr:item.matters
     });
  },

  hideHistoryDialog(event) {
    this.setData({ dialogHistoryShow: false });
  }
})