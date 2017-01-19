/**
 * Created by daeyoung on 2017-01-06.
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
    if(req.session.user==undefined){
        res.redirect('/?errorMessage=login_requirement');
    };
    //관리자만 가능하도록
    if(req.session.user.userType=='member'){
        res.redirect('/login');
        return;
    }

    var sql = 'select * from customer ORDER BY type';
    var customerList = [];
    conn.query(sql, function(err, result){
        customerList = result;
        res.render('customer_list', {customerList:customerList});
    });

});

//등록하기
router.post('/register', function(req, res){
    var name = req.body.name;
    var type = req.body.type;

    var sql = "INSERT INTO customer SET name='"+name+"', type='"+type+"'";
    conn.query(sql, function(err, result){
        var href = '/customer/register';
        res.send({href:href});
    });
});


//수정하기
router.post('/modify', function(req, res){
    var no = req.body.no;
    var name = req.body.name;
    var type = req.body.type;

    var sql = "SELECT * FROM customer WHERE no ="+no;

    conn.query(sql, function(err, result){
        var customer = result[0];
        customer.name = name;
        customer.type = type;

        var sql2 = "UPDATE customer SET ? WHERE no ="+no;
        conn.query(sql2, customer, function(err, result){
            var href = '/customer';
            res.send({href:href});
        });

    });

});

//삭제하기
router.get('/delete', function(req, res){
    var no = req.query.no;
    var sql = "DELETE FROM customer WHERE no ="+no;

    conn.query(sql, function(err, result){
        var href = '/customer/delete';
        res.send({href:href});
    });
});


//대분류
router.get('/getCustomerListByType', function(req, res){

    var type = req.query.type;
    var cus_list = [];
    var sql = '';
    if(type =='전체') {
        sql = "SELECT * FROM customer ORDER BY name";
    }else {
        sql = "SELECT * FROM customer WHERE type='" + type + "' ORDER BY name";
    }
    conn.query(sql, function(err, result){
        cus_list = result;
        res.send(cus_list);
    })


});

//ajax로 autocomplete기능 구현
router.post('/autocompleteByCustomer', function(req, res){
    var value = req.body.value;
    var customer_list = [];
    var sql = "select * from customer WHERE name LIKE '"+value+"%'";
    conn.query(sql, function(err, result){
       customer_list = result;
       res.send(customer_list);
    });

});



module.exports = router;