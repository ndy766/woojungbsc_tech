/**
 * Created by daeyoung on 2016-12-29.
 */
module.exports = {
    getHolidayArrays: function() {
        var holiday_arr = [];
        var year = new Date().getFullYear();

        holiday_arr.push({
            title : '신정',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-01-01",
            end : year+"-01-01",
        });
        holiday_arr.push({
            title : '설날',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start :"2017-01-27",
            end : "2017-01-27",
        });
        holiday_arr.push({
            title : '설날',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start :"2017-01-28",
            end : "2017-01-28",
        });
        holiday_arr.push({
            title : '설날',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start :"2017-01-29",
            end : "2017-01-29",
        });
        holiday_arr.push({
            title : '설날',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start :"2017-01-30",
            end : "2017-01-30",
        });
        holiday_arr.push({
            title : '삼일절',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-03-01",
            end : year+"-03-01",
        });
        holiday_arr.push({
            title : '석가탄신일',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : "2017-05-03",
            end : "2017-05-03",
        });
        holiday_arr.push({
            title : '어린이날',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-05-05",
            end : year+"-05-05",
        });
        holiday_arr.push({
            title : '현충일',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-06-06",
            end : year+"-06-06",
        });
        holiday_arr.push({
            title : '광복절',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-08-15",
            end : year+"-08-15",
        });
        holiday_arr.push({
            title : '개천절',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-10-03",
            end : year+"-10-03",
        });
        holiday_arr.push({
            title : '추석',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : "2017-10-04",
            end : "2017-10-04",
        });
        holiday_arr.push({
            title : '추석',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : "2017-10-05",
            end : "2017-10-05",
        });
        holiday_arr.push({
            title : '추석',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : "2017-10-06",
            end : "2017-10-06",
        });
        holiday_arr.push({
            title : '한글날',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-10-09",
            end : year+"-10-09",
        });
        holiday_arr.push({
            title : '성탄절',
            className:'holiday',
            color : 'white',
            textColor : 'red',
            start : year+"-12-25",
            end : year+"-12-25",
        });

        return holiday_arr;
    }
};