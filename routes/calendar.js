/**
 * Created by daeyoung on 2017-01-06.
 */
var express = require('express');
var router = express.Router();

router.get('/sample', function(req ,res){

   res.render('sample',{});
});

router.get('/registerForm', function(req, res){

   var start = req.query.start;
   var end   = req.query.end;

   //여기서 DB등록해야됨.



   //end가 1일 더해져있는 부분 수정해줌
   start = new Date(parseInt(start));
   end = new Date(parseInt(end)-86400000);
   start = start.getFullYear()+'년 '+(start.getMonth()+1)+'월 '+start.getDate()+'일';
   end = end.getFullYear()+'년 '+(end.getMonth()+1)+'월 '+end.getDate()+'일';

   res.render('register_form',{start:start, end:end, start_msec:req.query.start, end_msec:req.query.end});
});

router.post('/register', function(req, res){
   //parameter받아서 DB에 등록하고 다시 전체 일정의 캘린더를 불러와서 달력을 보여줌 - 등록하고 데이터를 전달 res.redirect할껀지, render해서 view의 ajax로 전부 처리할껀지 결정해야됨.

   var schedule = {}
   res.render('main',{schedule:schedule})

});



router.get('/getAllSchedule', function(req , res){
   console.log('getAllSchedule 들어옴');
   res.send({
      title : "파랑색 배경 & 글자색 검정색"
      , color : "#0000FF"
      , textColor : "#000000"
      , start : "2017-01-15"
      , end : "2017-01-25"
   })
});





module.exports = router;