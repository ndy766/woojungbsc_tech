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
    var sql = "SELECT * FROM equipment ORDER BY manufacturer, name";
    var equipment_list = [];

    if(req.session.user==undefined){
        res.redirect('/?errorMessage=login_requirement');
    };
    //관리자만 가능하도록
    if(req.session.user.userType=='member'){
        res.redirect('/login');
        return;
    };


    conn.query(sql, function(err, result){
        equipment_list = result;
        res.render('equipment_list',{
            name:name,
            equipment_list:equipment_list
        });
    });
});


router.get('/registerForm', function(req, res){
    var msg = req.query.msg;
    (msg!='' && msg!=undefined && msg!=null)?msg=msg:msg='';

    var sql = "SELECT * FROM code WHERE code_type='제조사'";
    var manufacturerList = [];
    conn.query(sql, function(err ,result){
        manufacturerList = result;
        res.render('equipment_register_form', {
            manufacturerList:manufacturerList,
            msg:msg
        });
    })

});

router.post('/register', function(req, res){
    var manufacturer = req.body.manufacturer;
    // var code_no = parseInt(req.body.code_no);
    var name = req.body.name;
    var id = '';

    var date = new Date();
    var rand = Math.floor(Math.random() * 9) + 1;

    var register_date = date.toISOString().split('T')[0];

    id = 'E-'+rand+date.getTime();



    var equipment = {
        id:id,
        name:name,
        manufacturer:manufacturer,
        register_date:register_date
    };
    var msg="";
    var sql =  "INSERT INTO equipment SET ?";
    conn.query(sql, equipment, function(err, result){
        msg ='등록 성공';
        res.redirect('/equipment/registerForm?msg='+msg);
    });
});

router.get('/delete', function(req, res){
    var id = req.query.id;
    var sql = "DELETE FROM equipment WHERE id='"+id+"'";
    conn.query(sql, function(err, result){
        res.redirect('/equipment');

    })
});


//수정폼
router.get('/modifyForm', function(req, res){
    var msg = req.query.msg;
    (msg!='' && msg!=undefined && msg!=null)?msg=msg:msg='';


    var id = req.query.id;
    var equipment = {};
    var sql = "SELECT * FROM equipment WHERE id='"+id+"'";
    conn.query(sql, function(err, result){
        equipment = result[0];

        var sql2 = "SELECT * FROM code WHERE code_type='제조사'";
        var manufacturerList = [];
        conn.query(sql2, function(err ,result){
            manufacturerList = result;
            res.render('equipment_modify_form', {
                manufacturerList:manufacturerList,
                msg:msg,
                equipment:equipment
            });
        })

    });
});


//수정하기
router.post('/modify', function(req, res){
    var id = req.body.id;
    var name = req.body.name;
    var manufacturer = req.body.manufacturer;
    var register_date = req.body.register_date;
    var msg="";

    var sql =  "UPDATE equipment SET name='"+name+"', manufacturer='"+ manufacturer +"' WHERE id='"+id+"'";
    conn.query(sql, function(err, result){
        msg ='수정 성공';
        res.redirect('/equipment/modifyForm?msg='+msg+'&id='+id);
    });
});


//검색 기능
router.post('/search', function (req, res) {
    var name = req.session.user.name;
    var searchType = req.body.searchType;
    var keyword = req.body.keyword;
    var equipment_list = [];
    var sql = "SELECT * FROM equipment WHERE " + searchType + " LIKE '%" + keyword + "%' ORDER BY manufacturer, name";

    conn.query(sql, function(err, result){
        equipment_list = result;
        res.render('equipment_list', {
            name:name,
            equipment_list:equipment_list
        });
    });


});



module.exports = router;