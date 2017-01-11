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



router.get('/', function(req ,res){
   res.render('calendar',{});
});

router.get('/registerForm', function(req, res){

   var start = req.query.start;
   var end   = req.query.end;

   start = new Date(parseInt(start));
   end = new Date(parseInt(end)-86400000); //end가 1일 더해져있는 부분 수정해줌
   start = start.getFullYear()+'년 '+(start.getMonth()+1)+'월 '+start.getDate()+'일';
   end = end.getFullYear()+'년 '+(end.getMonth()+1)+'월 '+end.getDate()+'일';



   //거래처 리스트를 조회해오는
   var sql = "SELECT * FROM customer ORDER BY name";
   var customerList = [];
   conn.query(sql, function(err, result){
      customerList = result;

      //기술부 직원 리스트를 조회해오는
      var sql2 = "SELECT * FROM member";
      var memberList = [];
      conn.query(sql2, function(err, result){
         memberList = result;

         var code_list = [];
         var work_type_List = [];
         var manufacturer_list = [];
         var undecided_reason_list = [];

         var sql3 = "SELECT * FROM code WHERE code_type='업무구분' OR code_type='미결사유' OR code_type='제조사'";
         conn.query(sql3, function(err, result){
            code_list = result;
            for(var i =0;i<code_list.length;i++){
               if(code_list[i].code_type=='업무구분'){
                  work_type_List.push(code_list[i]);
               }else if(code_list[i].code_type=='미결사유'){
                  undecided_reason_list.push(code_list[i]);
               }else if(code_list[i].code_type=='제조사'){
                  manufacturer_list.push(code_list[i]);
               }
            }


            res.render('calendar_register_form',{start:start, end:end, start_msec:req.query.start, end_msec:req.query.end, customerList:customerList, memberList:memberList, work_type_list:work_type_List, undecided_reason_list:undecided_reason_list, manufacturer_list:manufacturer_list});
         });


      });


   });

});

router.post('/register', function(req, res){
   //parameter받아서 DB에 등록하고 다시 전체 일정의 캘린더를 불러와서 달력을 보여줌 - 등록하고 데이터를 전달 res.redirect할껀지, render해서 view의 ajax로 전부 처리할껀지 결정해야됨.
   ;
   var start_date = new Date(parseInt(req.body.start_msec)).toISOString().split('T')[0];
   var end_date = new Date(parseInt(req.body.end_msec)).toISOString().split('T')[0];
   var customer_no = parseInt(req.body.customer_no);
   var chargerList =  req.body.charger;
   var manufacturer = req.body.manufacturer;
   var work_type = req.body.work_type;
   var equipment = req.body.equipment;
   var serial_number = req.body.serial_number;
   var work_detail = req.body.work_detail;
   var work_delay = req.body.work_delay;

   //170111추가된 부분
   var visit_type = req.body.visit_type;
   var revisit_count = req.body.revisit_count;
   var changed_component =  req.body.changed_component;
   var state = req.body.state;
   var undecided_reason=req.body.undecided_reason

   //신규 방문의 경우 재방문 횟수가 0임
   if(visit_type=="신규 방문"){
      revisit_count='0';
   };



   var tmp_arr = [];

   if(typeof chargerList=='object'){
      var temp ='';
      for(var i=0;i<chargerList.length;i++){
         if(i==chargerList.length-1){
            temp += chargerList[i];
         }else{
            temp +=chargerList[i]+',';
         }
         tmp_arr.push(chargerList[i]);
      }
      chargerList = temp;
   }else{
      tmp_arr.push(chargerList);
   }


   var sql = "SELECT * FROM customer WHERE no="+customer_no;
   var customer = {};
   conn.query(sql, function(err, result){
      customer = result[0];
      var find_helper = "";
      for(var i=0;i<tmp_arr.length;i++) {
         if(i==tmp_arr.length-1){
            find_helper += " id = '" + tmp_arr[i] + "'";
         }else {
            find_helper += " id = '" + tmp_arr[i] + "' OR";
         }
      }
      var sql2 = "SELECT * FROM member WHERE"+find_helper;
      var chargerArray = [];
      conn.query(sql2, function(err, result){
         chargerArray = result;
         var charger_name_string = "";
         for(var k=0;k<chargerArray.length;k++){
            if(k==chargerArray.length-1){
               charger_name_string+= chargerArray[k].name;
            }else{
               charger_name_string+= chargerArray[k].name+",";
            }
         }

         var sql3 = "INSERT INTO schedule SET ?";
         var schedule = {
            start_date:start_date,
            end_date:end_date,
            customer_no:customer_no,
            customer_name:customer.name,
            charger:chargerList,
            charger_name:charger_name_string,
            manufacturer:manufacturer,
            work_type:work_type,
            equipment:equipment,
            serial_number:serial_number,
            work_detail:work_detail,
            work_delay:work_delay,
            visit_type:visit_type,
            revisit_count:revisit_count,
            changed_component:changed_component,
            state:state,
            undecided_reason:undecided_reason
         };
         conn.query(sql3, schedule, function(err, result){
            res.redirect('/calendar');
         });


      });
   });
});



router.get('/getAllSchedule', function(req , res){
   var start_range = new Date(req.query.start).toISOString().split('T')[0];
   var end_range = new Date(req.query.end).toISOString().split('T')[0];
   var sql = "SELECT * FROM schedule WHERE start_date >='" +start_range+"' AND end_date <= '"+end_range+"'";
   var scheduleList = [];
   conn.query(sql, function(err, result){
      scheduleList = result;
      var event_arr = [];
      for(var i=0;i<scheduleList.length;i++){
         event_arr.push({
            title:scheduleList[i].charger_name + " / " +scheduleList[i].customer_name,
            color:"#0000FF",
            textColor : "#FFFFFF",
            start : scheduleList[i].start_date,
            end : scheduleList[i].end_date,
            no:scheduleList[i].no
         });
      }

      res.send(event_arr);
   });

});


//detail page
router.get('/getScheduleByNo', function(req, res){
   var start = req.query.start;
   var end = parseInt(req.query.end)-86400000;
   var start_date = new Date(parseInt(start)).getFullYear()+"년 "+ (new Date(parseInt(start)).getMonth()+1)+"월 "+ new Date(parseInt(start)).getDate()+"일";
   var end_date = new Date(parseInt(end)).getFullYear()+"년 "+ (new Date(parseInt(end)).getMonth()+1)+"월 "+ new Date(parseInt(end)).getDate()+"일";

   var no = req.query.no;

//거래처 리스트를 조회해오는
   var sql = "SELECT * FROM customer";
   var customerList = [];
   conn.query(sql, function(err, result){
      customerList = result;

      //기술부 직원 리스트를 조회해오는
      var sql2 = "SELECT * FROM member";
      var memberList = [];
      conn.query(sql2, function(err, result){
         memberList = result;
         var schedule = {};
         var sql3 = "SELECT * FROM schedule WHERE no="+no;

         conn.query(sql3, function(err, result){
            schedule = result[0];

            var code_list = [];
            var work_type_List = [];
            var manufacturer_list = [];
            var undecided_reason_list = [];

            var sql3 = "SELECT * FROM code WHERE code_type='업무구분' OR code_type='미결사유' OR code_type='제조사'";
            conn.query(sql3, function(err, result){
               code_list = result;
               for(var i =0;i<code_list.length;i++){
                  if(code_list[i].code_type=='업무구분'){
                     work_type_List.push(code_list[i]);
                  }else if(code_list[i].code_type=='미결사유'){
                     undecided_reason_list.push(code_list[i]);
                  }else if(code_list[i].code_type=='제조사'){
                     manufacturer_list.push(code_list[i]);
                  }
               }
               console.log(schedule);
               res.render('calendar_modify_form',{schedule:schedule, customerList:customerList, memberList:memberList, start:start_date, end:end_date, start_msec:req.query.start, end_msec:req.query.end, customerList:customerList, memberList:memberList, work_type_list:work_type_List, undecided_reason_list:undecided_reason_list, manufacturer_list:manufacturer_list});
            });

         });

      });

   });




});




module.exports = router;