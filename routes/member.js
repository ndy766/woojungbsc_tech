/**
 * Created by daeyoung on 2017-01-06.
 */
var express = require('express');
var router = express.Router();

//position helper
var positionCheck = require('../util/memberPositionCheck');

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

router.get('/', function(req, res){
    if(req.session.user==undefined){
        res.redirect('/?errorMessage=login_requirement');
    };

    //관리자만 가능하도록
    if(req.session.user.userType=='member'){
        res.redirect('/login');
        return;
    }

    var sql = 'select * from member ORDER BY position';
    var memberList = [];
    conn.query(sql, function(err, result){
        memberList = result;
        for(var i =0;i<memberList.length;i++){
            memberList[i].position = positionCheck.getMemberPosition(memberList[i].position);
        }
        res.render('member_list', {
            memberList:memberList,
            name : req.session.user.name
        });
    });

});

router.get('/registerForm', function(req, res){
   res.render('member_registerForm',{
       name:req.session.user.name
   });

});

router.post('/register', function(req, res){
   var member_id = req.body.id;
   var name = req.body.name;
   var position = req.body.position;
   var phone = req.body.phone;
   var password = req.body.password;
   var userType = 'member';


   var member = {
       id:member_id,
       name:name,
       position:position,
       phone:phone,
       password:password,
       userType:userType
   }

   var sql = "INSERT INTO member SET ?";

   conn.query(sql, member, function(err, result){
      res.redirect('/member');
   })
});







router.get('/getDetail', function(req, res){
   var member_id = req.query.id;
   var sql = "SELECT * FROM member WHERE id = '"+member_id+"'";
   var member = {};
   conn.query(sql, function(err, result){
      var member = result[0];

       member.position = positionCheck.getMemberPosition(member.position);
       res.render('member_detail', {
           member:member,
           name:req.session.user.name
       });

   });

});


router.post('/modify', function(req, res){
   var member_id = req.body.id;
   var name = req.body.name;
   var position = req.body.position;
   var phone = req.body.phone;
   var password = req.body.password;

   var sql = "SELECT * FROM member WHERE id = '"+member_id+"'";

   conn.query(sql, function(err, result){
       var member = result[0];
       member.name = name;
       member.position = position;
       member.phone = phone;
       member.password = password;

       var sql2 = "UPDATE member SET ? WHERE id ='" + member_id+"'";
       conn.query(sql2, member, function(err, result){

           res.redirect('/member')
       });

   });

});

router.get('/delete', function(req, res){
    var member_id = req.query.id;

    var sql = "DELETE FROM member WHERE id='"+member_id+"'";
    conn.query(sql, function(err, result){

       res.redirect('/member');
    });

});

//a/s 대표 방문자를 위한 NAME 리턴해주는 곳
router.get('/getNameByPhone', function(req, res){
    var phone = req.query.phone;
    var sql = "SELECT * FROM member WHERE phone = '"+phone+"'";
    var member = {};
    conn.query(sql, function(err, result){
        member = result[0];
       res.send(member);

    });
});



module.exports = router;
