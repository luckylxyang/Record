/**
 * 与今天的时间差值
 * @param {*} date1 
 */
export function diffDateOnToday(date1){
  let temp = new Date();
  let todayZero = new Date(temp.getFullYear(),temp.getMonth(),temp.getDate(),0,0,0)
  let todayLast = new Date(temp.getFullYear(),temp.getMonth(),temp.getDate(),23,59,59)
  let diff = '';
  if(todayZero > date1){
    diff = -1;
  }else if(todayZero <= date1 && todayLast >= date1){
    diff = 0;
  }else if(todayLast < date1){
    diff = 1;
  }
  return diff;
}