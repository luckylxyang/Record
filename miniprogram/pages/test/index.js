import { checkScope, getUserid } from '../../lib/login'

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
  },

  onReady: function () {
    this.popup = this.selectComponent("#popup");
  },
  onLoad: function () {
    let now = new Date();
    let year = now.getFullYear();
    let month = now.getMonth() + 1;
    this.dateInit();
    this.getMyRecords();
    this.setData({
      year: year,
      month: month,
      isToday: '' + year + month + now.getDate()
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
  },

  showDialog: function (event) {
    this.popup.showPopup();
  },

  //取消事件
  _error() {
    this.popup.hidePopup();
  },


  onRecord: function (select) {
    
    console.log("dialog3" , select);
    
    wx.showLoading({
      title: '打卡中',
    })
    let self = this
    this.popup.hidePopup();
    const db = wx.cloud.database('todo-online-lxy')
    const record = db.collection('record')
    let userId = wx.getStorageSync('userId')

    record.add({
      data: {
        userId: userId,
        record_date: new Date(),
        record_matter:select.detail.value
      },
      success: function (res) {
        wx.showToast({ title: '添加成功', icon: 'success', duration: 2000 })
      }
    })
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
        console.log(res);
        if (res.data) {
          res.data.forEach(item=>{
            item.checked = false
          });
          self.setData({
            matterArr: res.data
          })
          self.showDialog(e)
        }
      }
    })
  },

  /**
   * 添加打卡事项
   */
  addMyMatters(event) {
    const db = wx.cloud.database('todo-online-lxy')
    const matters = db.collection('matters')
    let userId = wx.getStorageSync('userId')
    if (!userId) {
      getUserid();
    }
    matters.add({
      data: {
        userId: userId,
        matter_name: '运动2',
      },
      success: function (res) {
        wx.showToast({ title: '添加成功', icon: 'success', duration: 2000 })
      }
    })
  },

  /**
   * 获取我的打卡记录
   */
  getMyRecords: function () {
    const db = wx.cloud.database('todo-online-lxy')
    const record = db.collection('record')
    const _ = db.command
    let userId = wx.getStorageSync('userId')
    let self = this;
    record.where({
      userId: userId,
      record_date:_.and(_.gt(this.getLastMouthDate(new Date())), _.lt(this.getNextMouthDate(new Date())))
    })
      .get({
        success(res) {
          console.log("getRecord", res);
          for (let i = 0; i < self.data.dateArr.length; i++) {
            let nowDate = self.data.dateArr[i].date;
            if(nowDate === undefined) continue;
            for (let j = 0; j < res.data.length; j++) {
              let recordDate = res.data[j].record_date;
              if (recordDate.getFullYear() === nowDate.getFullYear() && 
              recordDate.getMonth() === nowDate.getMonth() && recordDate.getDate() === nowDate.getDate()) {
                self.data.dateArr[i].isRecord = true;
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

  getLastMouthDate(date){
    var date=new Date(); 
    date.setDate(1);
    return date;
  },

  getNextMouthDate(date){
    var date=new Date();
    var currentMonth=date.getMonth();
    var nextMonth=++currentMonth;
    var nextMonthFirstDay=new Date(date.getFullYear(),nextMonth,1);
    var oneDay=1000*60*60*24;
    return new Date(nextMonthFirstDay-oneDay);
  }
})