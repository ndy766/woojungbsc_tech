var express = require('express');
var router = express.Router();

//paging
var paging = require('../util/paging');
var page_unit = paging.getPage();//페이지 단위

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

//Excel
var nodeExcel = require('excel-export');
var stringify = require('node-stringify');


//mail service
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://cscenterwoojung:woojung8302@smtp.gmail.com');

var mailOptions = {
    from: 'WOOJUNGBSC',
    to: '',
    subject: '',
    html: ''
};

//filesystem
var fs = require('fs');


//page ◀, ▶ 처리
router.get('/getAllListHelpedPagingGroup', function (req, res) {
    // flag == 0 ◀ / flag == 1 ▶
    var flag = req.query.flag;
    res.redirecst('/AS/getAllList?flag=' + flag);
});


/* GET home page. */
router.get('/getAllList', function (req, res) {
    if(req.session.user==undefined){
        res.redirect('/?errorMessage=login_requirement');
    };

    if (req.session.user.userType == 'member') {
        res.redirect('/login?errorMessage=admin_authority');
    }
    var currentPage = 1;
    var currentPageGroup = 1;


    currentPage = Number(req.session.pagingBean.current_page);


    if (req.query.page != null && req.query.page != undefined && req.query.page != '') {
        currentPage = req.query.page;
        req.session.pagingBean.current_page = currentPage;
    }


    currentPageGroup = Number(req.session.pagingBean.current_pageGroup);
    var flag;
    if (req.query.flag != null && req.query.flag != undefined && req.query.flag != '') {
        flag = req.query.flag;
        if (flag == '0') {
            currentPageGroup--;
            currentPage = currentPageGroup * page_unit;
        } else {
            currentPageGroup++;
            currentPage = (currentPageGroup * page_unit) - 9;
        }
        req.session.pagingBean.current_page = currentPage;
        req.session.pagingBean.current_pageGroup = currentPageGroup;
    };


    if (currentPage < 1 || currentPageGroup < 1) {
        currentPage = 1;
        currentPageGroup = 1;
        req.session.pagingBean.current_page = currentPage;
        req.session.pagingBean.current_pageGroup = currentPageGroup;
    }
    ;


    var sql = 'SELECT * FROM complaint ORDER BY no DESC LIMIT ' + ((currentPage * page_unit) - 10) + ',' + page_unit;

    if (req.session.searchingBean != null) {
        //유저가 검색을 통해서 session에 searchingBean을 계속 유지하는 경우
        var searchType = req.session.searchingBean.searchType;
        var keyword = req.session.searchingBean.keyword;
        sql = "SELECT * FROM complaint WHERE " + searchType + " LIKE '%" + keyword + "%' ORDER BY no DESC LIMIT " + ((currentPage * page_unit) - 10) + "," + page_unit;
    }
    var complaint_list = [];

    conn.query(sql, function (err, result) {
        complaint_list = result;
        var beginPage = (currentPageGroup * page_unit) - 9;
        var endPage = currentPageGroup * page_unit;
        res.render('complaint_list', {
            complaint_list: complaint_list,
            current_page: currentPage,
            beginPage: beginPage,
            endPage: endPage,
            name:req.session.user.name
        });
    })

});

router.get('/createForm', function (req, res) {
    //search를 초기화
    if (req.session.searchingBean) req.session.searchingBean = null;

    var errorMessage = "";
    if(req.query.errorMessage!=null && req.query.errorMessage!=undefined && req.query.errorMessage!=""){
        errorMessage = req.query.errorMessage;
    };



    var sql = 'select * from complaint order by no desc';
    var document_no = '';
    var stateCode = '';
    conn.query(sql, function (err, result) {
        if(result.length==0) {
            document_no = 'WJ-312-'+new Date().getFullYear().toString().substr(2,2)+'5-1';
        }else{
            document_no = 'WJ-312-'+new Date().getFullYear().toString().substr(2,2)+'5-'+(result[0].no + 1);
        }
        var sql2 = 'SELECT * FROM customer';
        var customerList = [];
        conn.query(sql2, function (err, result) {
            customerList = result;
            res.render('complaint_create_form', {
                no: document_no,
                stateCode: stateCode,
                errorMessage: errorMessage,
                customerList: customerList,
                name:req.session.user.name
            });
        });
    });

});

router.post('/create', function (req, res) {

    var document_no = req.body.doc_no;
    //validation check
    if(req.body.product.trim()=="" || req.body.customer_no.trim()=="" || req.body.content.trim()=="" || req.body.customer_email.trim()==""){
        res.redirect('/AS/createForm?errorMessage=formValidation');
        return;
    };


        var sql2 = 'SELECT name FROM customer WHERE no='+req.body.customer_no;
        conn.query(sql2, function(err, result){
            var customer = result[0];
            //mail도 보내야함
            //DB에 저장하고, 이메일을 보냄.
            var sql = 'INSERT INTO complaint SET ?';
            var state = 'A/S 접수완료';
            var complaint = {
                product: req.body.product,
                customer_no: req.body.customer_no,
                customer_name:customer.name,
                content: req.body.content,
                state: state,
                receipt_date: req.body.receipt_date,
                customer_email: req.body.customer_email,
                other_detail:req.body.other_detail,
                customer_charger:req.body.customer_charger,
                document_no:document_no
            };

            conn.query(sql, complaint, function (err, result) {

            mailOptions.to = complaint.customer_email;
            mailOptions.subject = '[(주)우정비에스씨]A/S신청 완료 되었습니다.';
            mailOptions.html =
                '<html>'+
                    '<head>' +
                    '<style>img{width:460px}table{width:460px}'+
                '</style>'+
                '</head>'+
                    '<body>'+
                '<font face="맑은고딕" color="#474747">' +
                '<div align="center">' +
                '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_top.jpg" width="460px"><br>' +
                '<table align="center" cellpadding="5" cellspacing="0" style="border:1px #D5D5D5 solid;position:relative; border-collapse: collapse" width="460px">' +
                ' <tr>' +
                '<td style="border-bottom:1px #D5D5D5 solid;background-color:#F6F6F6;" height="40px" align="center"><b>접수처</b></td>' +
                '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + customer.name + '</td>' +
                '<td style="border-bottom:1px #D5D5D5 solid;background-color:#F6F6F6;" align="center"><b>제품명</b></td>' +
                '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + complaint.product + '</td>' +
                '</tr>' +
                ' <tr>' +
                '<td style="border-bottom:1px #D5D5D5 solid;background-color:#F6F6F6;" height="40px" align="center"><b>접수내용</b></td>' +
                '<td  style="border-bottom:1px #D5D5D5 solid;"align="center" colspan="3">' + complaint.content + '</td>' +
                '</tr>' +
                ' <tr>' +
                '<td style="background-color:#F6F6F6" height="40px" align="center"><b>접수번호</b></td>' +
                '<td align="center">' + document_no + '</td>' +
                '<td style="background-color:#F6F6F6;" align="center"><b>접수일</b></td>' +
                '<td align="center">' + complaint.receipt_date + '</td>' +
                '</tr>' +
                '</table>' +
                '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_bottom.jpg" width="460px">' +
                '</div>' +
                '</font>'+
                '</body>';

                transporter.sendMail(mailOptions, function (err, result) {
                    if (err) {
                        return console.log(err);
                    }
                });
            res.redirect('/AS/getAllList');
        });

    });


});

//전체리스트에서 하나 클릭했을 경우
router.post('/getComplaintByNo', function (req, res) {
    var complaint_no = req.body.complaint_no;
    var stateCode = '';
    var sql = 'SELECT * FROM complaint WHERE no = ' + complaint_no;
    conn.query(sql, function (err, result) {
        var complaint = result[0];

        if (complaint.state == 'A/S 접수완료') {
            stateCode = "";
        } else if (complaint.state == 'A/S 방문일자 확정') {
            stateCode = '2';
        } else if (complaint.state == 'A/S 재방문 일자 확정') {
            stateCode = '3';
        } else {
            stateCode = '4';
        }
        res.render('complaint_detail' + stateCode, {complaint: complaint, stateCode: stateCode, name:req.session.user.name});
    })
});

//방문일자 확정폼
router.post('/confirmVisitForm', function (req, res) {
    var no = req.body.no;//접수번호
    var stateCode = '2';
    var sql = 'SELECT * FROM complaint WHERE no=' + no;
    conn.query(sql, function (err, result) {
        var complaint = result[0];
        var sql2 = 'SELECT * FROM member ORDER BY position';
        var memberList = [];
        conn.query(sql2, function(err, result){
            var memberList = result;
            res.render('visit_form', {complaint: complaint, stateCode: stateCode, memberList:memberList, name:req.session.user.name})
        });

    });

});

//방문일자 확정하기
router.post('/confirmVisit', function (req, res) {
    var no = req.body.no;
    var visit_date = req.body.visit_date;
    var charger = req.body.charger;
    var charger_phone = req.body.charger_phone;
    var other_detail = req.body.other_detail;
    var state = 'A/S 방문일자 확정';
    var revisit_count = '0';
    var revisit_reason = '';
    var representative_charger = req.body.representative_charger;

    var sql = 'SELECT * FROM complaint WHERE no=' + no;
    conn.query(sql, function (err, result) {
        var complaint = result[0];
        complaint.visit_date = visit_date;
        complaint.charger = charger;
        complaint.state = state;
        complaint.charger_phone = charger_phone;
        complaint.other_detail = other_detail;
        complaint.revisit_count = revisit_count;
        complaint.revisit_reason = revisit_reason;
        complaint.representative_charger = representative_charger;
        var sql2 = 'UPDATE complaint SET ? WHERE no=' + no;
        if (err) {
            console.log('error발생 : ' + err);
        } else {
            conn.query(sql2, complaint, function (err, result) {
                //해당 complaint을 찾아온 뒤 메일 전송
                var sql3 = 'SELECT * FROM complaint WHERE no=' + no;
                conn.query(sql3, function (err, result) {
                    var complaint = result[0];

                    var charger_list_for_mail = complaint.charger;
                    if(complaint.charger.indexOf(',')!=-1){
                        charger_list_for_mail = complaint.charger.split(',')[0]+' 외 '+(complaint.charger.split(',').length-1)+'인';
                    };


                    mailOptions.to = complaint.customer_email;
                    mailOptions.subject = '[(주)우정비에스씨]A/S방문 일자가 확정 되었습니다.';
                    mailOptions.html =
                        '<font face="맑은고딕" color="#474747">' +
                        '<div align="center">' +
                        '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_top2.jpg" width="460px"><br>' +
                        '<table  align="center" class="table-bordered" cellpadding="5" cellspacing="0" style="border-collapse:collapse;border:1px #D5D5D5 solid;position:relative;" width="460px">' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6; border-bottom:1px #D5D5D5 solid;" height="40px" align="center"><b>접수처</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + complaint.customer_name + '</td>' +
                        '<td  style="background-color:#F6F6F6; border-bottom:1px #D5D5D5 solid;"align="center"><b>제품명</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + complaint.product + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6; border-bottom:1px #D5D5D5 solid;" height="40px" align="center"><b>접수내용</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;"align="center" colspan="3">' + complaint.content + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6; border-bottom:1px #D5D5D5 solid;" height="40px" align="center"><b>접수번호</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + complaint.document_no + '</td>' +
                        '<td style="background-color:#F6F6F6; border-bottom:1px #D5D5D5 solid;" align="center"><b>접수일</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + complaint.receipt_date + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6; border-bottom:1px #D5D5D5 solid;" height="40px" align="center"><b>담당자</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + charger_list_for_mail + '</td>' +
                        '<td style="background-color:#F6F6F6; border-bottom:1px #D5D5D5 solid;" align="center"><b>방문일</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;" align="center">' + complaint.visit_date + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom:1px #D5D5D5 solid;" height="40px" align="center"><b>담당자 전화번호</b></td>' +
                        '<td style="border-bottom:1px #D5D5D5 solid;" align="center" colspan="3">' + complaint.charger_phone+' ('+complaint.representative_charger+')' + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_bottom.jpg" width="460px">' +
                        '</div>' +
                        '</font>';
                    transporter.sendMail(mailOptions, function (err, result) {
                        if (err) {
                            return console.log(err);
                        }

                        res.redirect('/AS/getAllList');
                    });

                });
            });
        }
    });
});


//재방문일자 확정폼
router.post('/confirmReVisitForm', function (req, res) {
    var no = req.body.no;
    var stateCode = '3';
    var sql = 'SELECT * FROM complaint WHERE no=' + no;
    conn.query(sql, function (err, result) {
        var complaint = result[0];

        var sql2 = "SELECT * FROM member ORDER BY position";
        var memberList = [];
        conn.query(sql2, function(err, result){
            var memberList = result;
            res.render('revisit_form', {complaint: complaint, stateCode: stateCode, memberList:memberList, name:req.session.user.name})
        });
    });
});

//재방문 일자 확정하기
router.post('/confirmReVisit', function (req, res) {
    var no = req.body.no;
    var revisit_date = req.body.revisit_date;
    var charger = req.body.charger;
    var charger_phone = req.body.charger_phone;
    var revisit_reason = req.body.revisit_reason;
    var customer_charger = req.body.customer_charger;//새로 추가됨 1월 24일
    var customer_email = req.body.customer_email;//새로 추가됨 1월 24일
    var state = 'A/S 재방문 일자 확정';
    var representative_charger = req.body.representative_charger;

    var sql = 'SELECT * FROM complaint WHERE no=' + no;
    conn.query(sql, function (err, result) {
        var complaint = result[0];
        complaint.revisit_date = revisit_date;
        complaint.charger = charger;
        complaint.charger_phone = charger_phone;
        complaint.revisit_reason = revisit_reason;
        complaint.state = state;
        complaint.customer_charger = customer_charger;
        complaint.customer_email = customer_email;
        complaint.revisit_count = parseInt(complaint.revisit_count)+1;
        complaint.representative_charger = representative_charger;
        var sql2 = 'UPDATE complaint SET ? WHERE no=' + no;
        if (err) {
            console.log('error발생 : ' + err);
        } else {
            conn.query(sql2, complaint, function (err, result) {
                //해당 complaint을 찾아온 뒤 메일 전송
                var sql3 = 'SELECT * FROM complaint WHERE no=' + no;
                conn.query(sql3, function (err, result) {
                    var complaint = result[0];

                    var charger_list_for_mail = complaint.charger;
                    if(complaint.charger.indexOf(',')!=-1){
                        charger_list_for_mail = complaint.charger.split(',')[0]+' 외 '+(complaint.charger.split(',').length-1)+'인';
                    };


                    mailOptions.to = complaint.customer_email;
                    mailOptions.subject = '[(주)우정비에스씨]A/S 재방문 일자가 확정 되었습니다.';
                    mailOptions.html =
                        '<font face="맑은고딕" color="#474747">' +
                        '<div align="center">' +
                        '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_top3.jpg" width="460px"><br>' +
                        '<table  align="center" class="table-bordered" cellpadding="5" cellspacing="0" style="border-collapse:collapse;border:1px #D5D5D5 solid;position:relative;" width="460px">' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;border-top: 1px #D5D5D5 solid;" height="40px" align="center"><b>접수처</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.customer_name + '</td>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;border-top: 1px #D5D5D5 solid;" align="center"><b>제품명</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.product + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" height="40px" align="center"><b>접수내용</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center" colspan="3">' + complaint.content + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" height="40px" align="center"><b>사유</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center" colspan="3">' + complaint.revisit_reason + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;"height="40px" align="center"><b>접수번호</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.document_no + '</td>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" align="center"><b>접수일</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.receipt_date + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" height="40px" align="center"><b>담당자</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + charger_list_for_mail + '</td>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" align="center"><b>재방문일</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.revisit_date + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" height="40px" align="center"><b>담당자 전화번호</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center" colspan="3">' + complaint.charger_phone+' ('+complaint.representative_charger+')' + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_bottom.jpg" width="460px">' +
                        '</div>' +
                        '</font>';
                    transporter.sendMail(mailOptions, function (err, result) {
                        if (err) {
                            return console.log(err);
                        }

                        res.redirect('/AS/getAllList');
                    });

                });
            });
        }
    });
});


//AS 완료하기
//해당 AS가 재방문을 거쳤는지 안거쳤는지에 따라서 메일이 달라짐
router.get('/complete', function (req, res) {
    var no = req.query.no;
    //var customer_email = req.body.customer_email;
    var date = new Date();
    var complete_date = date.getFullYear() + '년 ' + (date.getMonth() + 1) + '월 ' + date.getDate() + '일';
    var state = 'A/S 완료';

    //no로 complaint 뽑아와서
    var sql = 'SELECT * FROM complaint WHERE no=' + no;
    conn.query(sql, function (err, result) {
        var complaint = result[0];
        complaint.complete_date = complete_date;
        complaint.state = state;
        var sql2 = 'UPDATE complaint SET ? WHERE no=' + no;
        if (err) {
            console.log('error발생 : ' + err);
        } else {
            conn.query(sql2, complaint, function (err, result) {
                //해당 complaint을 찾아온 뒤 메일 전송
                var sql3 = 'SELECT * FROM complaint WHERE no=' + no;
                conn.query(sql3, function (err, result) {
                    var complaint = result[0];

                    mailOptions.to = complaint.customer_email;
                    mailOptions.subject = '[(주)우정비에스씨]A/S 처리가 완료 되었습니다.';
                    mailOptions.html =
                        '<font face="맑은고딕" color="#474747">' +
                        '<div align="center">' +
                        '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_top4.jpg" width="460px"><br>' +
                        '<table align="center" class="table-bordered" cellpadding="5" cellspacing="0" style="border-collapse:collapse;border:1px #D5D5D5 solid;position:relative;" width="460px">' +
                        '<tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" height="40px" align="center"><b>접수처</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.customer_name + '</td>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" align="center"><b>제품명</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.product + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" height="40px" align="center"><b>접수내용</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center" colspan="3">' + complaint.content + '</td>' +
                        '</tr>' +
                        ' <tr>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" height="40px" align="center"><b>접수번호</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.document_no + '</td>' +
                        '<td style="background-color:#F6F6F6;border-bottom: 1px #D5D5D5 solid;" align="center"><b>완료일</b></td>' +
                        '<td style="border-bottom: 1px #D5D5D5 solid;" align="center">' + complaint.complete_date + '</td>' +
                        '</tr>' +
                        '</table>' +
                        '<img src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/as_mail_bottom.jpg" width="460px">' +
                        '</div>' +
                        '</font>';
                    transporter.sendMail(mailOptions, function (err, result) {
                        if (err) {
                            return console.log(err);
                        }

                        res.redirect('/AS/getAllList');
                    });


                });
            });
        }
    });

});

//검색 기능
router.post('/search', function (req, res) {
    var searchType = req.body.searchType;
    var keyword = req.body.keyword;
    var searchingBean = {
        searchType: searchType,
        keyword: keyword
    };
    req.session.searchingBean = searchingBean;
    res.redirect('/AS/getAllList');
});

//엑셀 추출
router.get('/excel', function (req, res) {
    var temp = [];
    var sql = 'SELECT * FROM complaint';

    conn.query(sql, function (err, result) {
        //excel코드
        var conf = {};
        conf.name = 'complaint';
        conf.cols = [
            {
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
            caption: '방문자 전화번호',
            type: 'string'
        }, {
            caption : '고객 이메일',
            type: 'string'
        }, {
            caption : '기타 사항',
            type: 'string'
        }, {
            caption : '거래처 담당자',
            type: 'string'
        }
        ];
        var data = result;
        for (var i = 0; i < data.length; i++) {
            var buffer = [
                data[i].document_no,
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
                data[i].customer_email? data[i].customer_email : '',
                data[i].other_detail? data[i].other_detail : '',
                data[i].customer_charger ? data[i].customer_charger:''
                ];
            temp.push(buffer);
        };

        conf.rows = temp;
        var _result = nodeExcel.execute(conf);
        res.setHeader('Content-Type', 'application/vnd.openxmlformates');
        res.setHeader("Content-Disposition", "attachment;filename=" + "complaint.xlsx");
        res.end(_result, 'binary');

    });

});


module.exports = router;
