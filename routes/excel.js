/**
 * Created by daeyoung on 2017-01-12.
 */
var express = require('express');
var router = express.Router();

//db
var mysql = require('mysql');
var DBoption = {
    host: 'ndy766.cpaacnjpvo5o.ap-northeast-2.rds.amazonaws.com',
    port: 3306,
    user: 'ndy766',
    password: 'shel45951!',
    database: 'ndy766'
};
var conn = mysql.createConnection(DBoption);
conn.connect();

//excel
var nodeExcel = require('excel-export');

router.get('/', function(req, res){
    if(req.session.user==undefined){
        res.redirect('/?errorMessage=login_requirement');
    };

    res.render('excel_list', {
        name:req.session.user.name
    });
})

router.get('/complaint',function(req, res){
    var temp = [];
    var sql = 'SELECT * FROM complaint';

    conn.query(sql, function (err, result) {

        var conf = {};
        conf.name = 'complaint';
        conf.cols = [{
            caption: '접수번호',
            type: 'string'
        }, {
            caption: '제품명',
            type: 'string'
        }, {
            caption: '접수처',
            type: 'string'
        }, {
            caption: '접수 내용',
            type: 'string'
        }, {
            caption: '접수상태',
            type: 'string'
        }, {
            caption: '접수일',
            type: 'string'
        }, {
            caption: '방문일',
            type: 'string'
        }, {
            caption: '재방문일',
            type: 'string'
        }, {
            caption: '완료일',
            type: 'string'
        }, {
            caption: '방문자',
            type: 'string'
        }, {
            caption: '재방문 사유',
            type: 'string'
        }, {
            caption: '담당자 전화번호',
            type: 'string'
        }];
        var data = result;
        for (var i = 0; i < data.length; i++) {
            var buffer = ['WJ - ' + data[i].no,
                data[i].product,
                data[i].customer_name,
                data[i].content,
                data[i].state,
                data[i].receipt_date,
                data[i].visit_date ? data[i].visit_date : '',
                data[i].revisit_date ? data[i].revisit_date : '',
                data[i].complete_date ? data[i].complete_date : '',
                data[i].charger ? data[i].charger : '',
                data[i].revisit_reason ? data[i].revisit_reason : '',
                data[i].charger_phone ? data[i].charger_phone : '',
                data[i].customer_email];
            temp.push(buffer);
        }
        ;

        conf.rows = temp;
        var _result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.setHeader("Content-Disposition", "attachment;filename=" + "complaint.xlsx");
        res.end(_result, 'binary');

    });

});

//calendar 추출
router.get('/calendar', function(req, res){
    var temp = [];
    var sql = 'SELECT * FROM schedule';

    conn.query(sql, function (err, result) {

        var conf = {};
        conf.name = 'schedule';
        conf.cols = [{
            caption: '고유번호',
            type: 'string'
        }, {
            caption: '시작일',
            type: 'string'
        }, {
            caption: '종료일',
            type: 'string'
        }, {
            caption: '거래처 고유번호',
            type: 'string'
        }, {
            caption: '거래처명',
            type: 'string'
        }, {
            caption: '방문자 아이디',
            type: 'string'
        }, {
            caption: '방문자 이름',
            type: 'string'
        }, {
            caption: '제조사',
            type: 'string'
        }, {
            caption: '업무 구분',
            type: 'string'
        }, {
            caption: '제품명',
            type: 'string'
        }, {
            caption: '시리얼 넘버',
            type: 'string'
        }, {
            caption: '조치사항',
            type: 'string'
        }, {
            caption: '소요시간',
            type: 'string'
        }, {
            caption: '방문형태',
            type: 'string'
        }, {
            caption: '재방문 횟수',
            type: 'string'
        }, {
            caption: '교체장비',
            type: 'string'
        }, {
            caption: '처리 상태',
            type: 'string'
        }, {
            caption: '미결 사유',
            type: 'string'
        }];
        var data = result;
        for (var i = 0; i < data.length; i++) {
            var buffer = [
                data[i].no+'',
                data[i].start_date,
                data[i].end_date,
                data[i].customer_no ? data[i].customer_no+'' : '',
                data[i].customer_name ? data[i].customer_name : '',
                data[i].charger ? data[i].charger : '',
                data[i].charger_name ? data[i].charger_name : '',
                data[i].manufacturer ? data[i].manufacturer : '',
                data[i].work_type ? data[i].work_type : '',
                data[i].equipment ? data[i].equipment : '',
                data[i].serial_number ? data[i].serial_number : '',
                data[i].work_detail ? data[i].work_detail : '',
                data[i].work_delay ? data[i].work_delay : '',
                data[i].visit_type ? data[i].visit_type : '',
                data[i].revisit_count ? data[i].revisit_count+'' : '',
                data[i].changed_component ? data[i].changed_component : '',
                data[i].state ? data[i].state : '',
                data[i].undecided_reason  ? data[i].undecided_reason : ''
                ];
            temp.push(buffer);
        }
        ;

        conf.rows = temp;
        var _result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.setHeader("Content-Disposition", "attachment;filename=" + "schedule.xlsx");
        res.end(_result, 'binary');

    });

});


module.exports = router;