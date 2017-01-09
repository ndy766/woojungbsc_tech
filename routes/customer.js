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
    //관리자만 가능하도록
    if(req.session.user.userType=='customer'){
        res.redirect('/login');
        return;
    }

    var sql = 'select * from customer';
    var customerList = [];
    conn.query(sql, function(err, result){
        customerList = result;
        res.render('customer_list', {customerList:customerList});
    });

});

//등록하기
router.post('/register', function(req, res){
    var name = req.body.name;

    var sql = "INSERT INTO customer SET name='"+name+"'";
    conn.query(sql, function(err, result){
        var href = '/customer/register';
        res.send({href:href});
    });
});


//수정하기
router.post('/modify', function(req, res){
    var no = req.body.no;
    var name = req.body.name;

    var sql = "SELECT * FROM customer WHERE no ="+no;

    conn.query(sql, function(err, result){
        var customer = result[0];
        customer.name = name;

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




module.exports = router;