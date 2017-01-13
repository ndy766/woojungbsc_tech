/**
 * Created by daeyoung on 2016-12-29.
 */

exports.setHolidays = function(name ,start_month, end_month, start_day, end_day){
    var holiday = {};
    holiday.title = name;
    holiday.start = year+"-"+start_month+"-"+end_day;
    holiday.end = year+"-"+end_month+"-"+end_day;
    holiday.id="-1";
    holiday.color = "red";
    holiday.all_Day = tre;
    return holiday;
};