/**
 * Created by daeyoung on 2017-01-12.
 */
var express = require('express');
var router = express.Router();

//db
var mysql = require('mysql');
var DBoption = {
    host:'woojungtech.cae5hy4xib6f.ap-northeast-2.rds.amazonaws.com',
    port:3306,
    user:'woojungTech',
    password:'woojung8302',
    database:'woojungTech'
};
var conn = mysql.createConnection(DBoption);
conn.connect();

//excel
var nodeExcel = require('excel-export');

router.get('/', function(req, res){
    if(req.session.user.userType=='member'){
        res.redirect('/');
    }

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
            caption: '문서번호',
            type: 'string'
        },{
            caption: '제품명',
            type: 'string'
        }, {
            caption: '거래처',
            type: 'string'
        }, {
            caption: '거래처 담당자',
            type: 'string'
        }, {
            caption: '거래처 담당자 이메일',
            type: 'string'
        }, {
            caption: '접수 내용',
            type: 'string'
        }, {
            caption: '기타 사항',
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
            caption: '재망문 횟수',
            type: 'string'
        }, {
            caption: '재방문 사유',
            type: 'string'
        }, {
            caption: '방문자',
            type: 'string'
        }];
        var data = result;
        for (var i = 0; i < data.length; i++) {
            var buffer = [
                data[i].no+'',
                data[i].document_no+'',
                data[i].product,
                data[i].customer_name,
                data[i].customer_charger,
                data[i].customer_email,
                data[i].content,
                data[i].other_detail?data[i].other_detail:'',
                data[i].state,
                data[i].receipt_date,
                data[i].visit_date ? data[i].visit_date : '',
                data[i].revisit_date ? data[i].revisit_date : '',
                data[i].complete_date ? data[i].complete_date : '',
                data[i].revisit_count ? data[i].revisit_count : '',
                data[i].revisit_reason ? data[i].revisit_reason : '',
                data[i].charger ? data[i].charger : ''
            ];
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

//a/s report 추출
router.get('/complaint_report', function(req, res){
    var temp = [];
    var sql = 'SELECT * FROM complaint_report';

    conn.query(sql, function (err, result) {

        var conf = {};
        conf.name = 'complaint_report';
        conf.cols = [{
            caption: '고유번호',
            type: 'string'
        }, {
            caption: '문서번호',
            type: 'string'
        }, {
            caption: '제목',
            type: 'string'
        }, {
            caption: '발신처',
            type: 'string'
        }, {
            caption: '작성일',
            type: 'string'
        }, {
            caption: '점검 시작일',
            type: 'string'
        },{
            caption: '점검 종료일',
            type: 'string'
        }, {
            caption: '작성자',
            type: 'string'
        }, {
            caption: '수신처',
            type: 'string'
        }, {
            caption: '수신인(참조인)',
            type: 'string'
        }, {
            caption: '참조인 전화번호',
            type: 'string'
        }, {
            caption: '장비명',
            type: 'string'
        }, {
            caption: '설치장소',
            type: 'string'
        }, {
            caption: '고장 내용',
            type: 'string'
        }, {
            caption: '업무 내용',
            type: 'string'
        }, {
            caption: '수신인 이메일',
            type: 'string'
        }];
        var data = result;
        for (var i = 0; i < data.length; i++) {
            var buffer = [
                data[i].no+'',
                data[i].document_no,
                data[i].subject,
                data[i].sender ? data[i].sender+'' : '',
                data[i].write_date ? data[i].write_date : '',
                data[i].inspection_start_date ? data[i].inspection_start_date : '',
                data[i].inspection_end_date ? data[i].inspection_end_date : '',
                data[i].writer ? data[i].writer : '',
                data[i].customer_name ? data[i].customer_name : '',
                data[i].receiver ? data[i].receiver : '',
                data[i].receiver_phone ? data[i].receiver_phone : '',
                data[i].equipment ? data[i].equipment : '',
                data[i].place ? data[i].place : '',
                data[i].failure ? data[i].failure+'' : '',
                data[i].work_detail ? data[i].work_detail+'' : '',
                data[i].email ? data[i].email : ''
            ];
            temp.push(buffer);
        }
        ;

        conf.rows = temp;
        var _result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.setHeader("Content-Disposition", "attachment;filename=" + "report.xlsx");
        res.end(_result, 'binary');

    });

});


//주소록
router.get('/address_book',function(req, res){
    var temp = [];
    var sql = 'SELECT * FROM address_book';

    conn.query(sql, function (err, result) {

        var conf = {};
        conf.name = 'address_book';
        conf.cols = [{
            caption: '순번',
            type: 'string'
        },{
            caption: '거래처',
            type: 'string'
        }, {
            caption: '이름',
            type: 'string'
        },{
            caption: '전화번호',
            type: 'string'
        }, {
            caption: '이메일',
            type: 'string'
        }];
        var data = result;
        for (var i = 0; i < data.length; i++) {
            var buffer = [
                (i+1)+'',
                data[i].customer_name,
                data[i].name,
                data[i].phone,
                data[i].email
            ];
            temp.push(buffer);
        }
        ;

        conf.rows = temp;
        var _result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.setHeader("Content-Disposition", "attachment;filename=" + "address_book.xlsx");
        res.end(_result, 'binary');

    });
});


//거래처 리스트
router.get('/customer',function(req, res){
    var temp = [];
    var sql = 'SELECT * FROM customer';

    conn.query(sql, function (err, result) {

        var conf = {};
        conf.name = 'customer';
        conf.cols = [{
            caption: '순번',
            type: 'string'
        },{
            caption: '이름',
            type: 'string'
        },{
            caption: '거래처 타입',
            type: 'string'
        },{
            caption: '고유 번호',
            type: 'string'
        }];
        var data = result;
        for (var i = 0; i < data.length; i++) {
            var buffer = [
                (i+1)+'',
                data[i].name,
                data[i].type,
                data[i].no+''
            ];
            temp.push(buffer);
        }
        ;

        conf.rows = temp;
        var _result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.setHeader("Content-Disposition", "attachment;filename=" + "customer.xlsx");
        res.end(_result, 'binary');

    });
});


module.exports = router;