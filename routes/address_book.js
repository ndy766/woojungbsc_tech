/**
 * Created by daeyoung on 2017-01-25.
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



router.get('/', function(req, res){
    var name = req.session.user.name;
    var sql = "SELECT * FROM address_book ORDER BY customer_name";
    var address_list = [];

    conn.query(sql, function(err, result){
        address_list = result;
        res.render('address_book_list',{
            name:name,
            address_list:address_list
        });
    });

});

router.get('/registerForm', function(req, res){
    var msg = req.query.msg;
    (msg!='' && msg!=undefined && msg!=null)?msg=msg:msg='';

    var sql = "SELECT * FROM customer ORDER BY name";
    var customerList = [];
    conn.query(sql, function(err ,result){
        customerList = result;
        res.render('address_book_register_form', {
            customerList:customerList,
            msg:msg
        });
    })

});

router.post('/register', function(req, res){
    var name = req.body.name;
    var phone = req.body.phone;
    var email = req.body.email;
    var customer_name = req.body.customer_name;
    var msg="";
    var address = {
        name:name,
        phone:phone,
        email:email,
        customer_name:customer_name
    };
    var sql =  "INSERT INTO address_book SET ?";
    conn.query(sql, address, function(err, result){
        msg ='등록 성공';
        res.redirect('/addressBook/registerForm?msg='+msg);
    });
});

router.get('/delete', function(req, res){
    var email = req.query.email;
    var sql = "DELETE FROM address_book WHERE email='"+email+"'";
    conn.query(sql, function(err, result){
        res.redirect('/addressBook');

    })
});


//수정폼
router.get('/modifyForm', function(req, res){
    var msg = req.query.msg;
    (msg!='' && msg!=undefined && msg!=null)?msg=msg:msg='';


    var email = req.query.email;
    var address = {};
    var sql = "SELECT * FROM address_book WHERE email='"+email+"'";
    conn.query(sql, function(err, result){
        address = result[0];

        var sql2 = "SELECT * FROM customer ORDER BY name";
        var customerList = [];
        conn.query(sql2, function(err ,result){
            customerList = result;
            res.render('address_book_modify_form', {
                customerList:customerList,
                msg:msg,
                address:address
            });
        })

    });
});


//수정하기
router.post('/modify', function(req, res){
    var name = req.body.name;
    var phone = req.body.phone;
    var email = req.body.email;
    var customer_name = req.body.customer_name;
    var msg="";
    var address = {
        email:email,
        name:name,
        phone:phone,
        customer_name:customer_name
    };
    console.log(address);
    var sql =  "UPDATE address_book SET ? WHERE email='"+email+"'";
    conn.query(sql, address, function(err, result){
        msg ='수정 성공';
        res.redirect('/addressBook/modifyForm?msg='+msg+'&email='+email);
    });
});


//검색 기능
router.post('/search', function (req, res) {
    var name = req.session.user.name;
    var searchType = req.body.searchType;
    var keyword = req.body.keyword;
    var address_list = [];
    var sql = "SELECT * FROM address_book WHERE " + searchType + " LIKE '%" + keyword + "%' ORDER BY name DESC";

    conn.query(sql, function(err, result){
        address_list = result;
        res.render('address_book_list', {
            name:name,
            address_list:address_list
        });
    });


});


//자동완성 기능
router.post('/autocompleteByAddressBook', function(req, res){
    var value = req.body.value;
    var sql = "SELECT * FROM address_book WHERE name LIKE '"+value+"%' OR customer_name LIKE '"+value+"%' ORDER BY name";
    conn.query(sql, function(err, result){
        res.send(result);
    });
});




module.exports = router;