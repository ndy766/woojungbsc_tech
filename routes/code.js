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

    var sql = 'select * from code ORDER BY code_type desc';
    var codeList = [];
    conn.query(sql, function(err, result){
        codeList = result;
        res.render('code_list', {
            codeList:codeList,
            name:req.session.user.name
        });
    });

});

//등록하기
router.post('/register', function(req, res){
    var code_name = req.body.code_name;
    var code_type = req.body.code_type;

    var sql = "INSERT INTO code SET code_name='"+code_name+"', code_type='"+code_type+"'";
        conn.query(sql, function(err, result){
            var href = '/code/register';
        res.send({href:href});
    });
});


//수정하기
router.post('/modify', function(req, res){
    var code_no = req.body.code_no;
    var code_name = req.body.code_name;
    var code_type = req.body.code_type;

    var sql = "SELECT * FROM code WHERE code_no ="+code_no;

    conn.query(sql, function(err, result){
        var code = result[0];
        code.code_name = code_name;
        code.code_type = code_type;

        var sql2 = "UPDATE code SET ? WHERE code_no ="+code_no;
        conn.query(sql2, code, function(err, result){
            var href = '/code';
            res.send({href:href});
        });

    });

});

//삭제하기
router.get('/delete', function(req, res){
    var code_no = req.query.code_no;
    var sql = "DELETE FROM code WHERE code_no ="+code_no;

    conn.query(sql, function(err, result){
        var href = '/code/delete';
        res.send({
            href:href
        });
    });
});




module.exports = router;