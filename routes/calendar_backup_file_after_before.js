/**
 * Created by daeyoung on 2017-01-06.
 */
var express = require('express');
var router = express.Router();


//file
var multiparty = require('multiparty');
var fs = require('fs');


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

//공휴일 지정
var holiday = require('../util/holiday');


//mail service
var nodemailer = require('nodemailer');
var inlineCss = require('nodemailer-juice');//for nodemailer css

var transporter = nodemailer.createTransport('smtps://cscenterwoojung:woojung8302@smtp.gmail.com');
transporter.use('compile', inlineCss());

var mailOptions = {
   from: 'WOOJUNGBSC',
   to: '',
   subject: '',
   html: ''
};




//디렉토리 존재하는지 check하는 함수
function checkDirectory(directory, callback) {
   fs.stat(directory, function(err, stats) {
      //Check if error defined and the error code is "not exists"
      if (err && err.errno === 34) {
         //Create the directory, call the callback.
         fs.mkdir(directory, callback);
      } else {
         //just in case there was a different error:
         callback(err)
      }
   });
}






router.get('/', function(req ,res){

   if(req.session.user==undefined){
      res.redirect('/?errorMessage=login_requirement');
   };

   res.render('calendar',{name:req.session.user.name});
});


router.get('/registerForm', function(req, res){

   var start = req.query.start;
   var end   = req.query.end;
   var final_correction_time = new Date();
   final_correction_time =(final_correction_time.getMonth()+1)+'월 '+ final_correction_time.getDate() + '일 '+('0'+final_correction_time.getHours()).slice(-2)+':'+('0'+final_correction_time.getMinutes()).slice(-2);

   if(req.query.registerType!=null && req.query.registerType!=undefined && req.query.registerType!=''){
      //+버튼을 통해서 넘어온 경우
      start = '';
      end = '';
   }else {
      //그 밖의 경우에는 select를 통해서 들어온 경우임
      start = new Date(parseInt(start));
      end = new Date(parseInt(parseInt(end) - 86400000)); //end가 1일 더해져있는 부분 수정해줌
      //start = start.getFullYear()+'년 '+(start.getMonth()+1)+'월 '+start.getDate()+'일';
      //end = end.getFullYear()+'년 '+(end.getMonth()+1)+'월 '+end.getDate()+'일';
      start = start.toISOString().split('T')[0];
      end = end.toISOString().split('T')[0];
   }

   //거래처 리스트를 조회해오는
   var sql = "SELECT * FROM customer ORDER BY name";
   var customerList = [];
   conn.query(sql, function(err, result){
      customerList = result;

      //기술부 직원 리스트를 조회해오는
      var sql2 = "SELECT * FROM member ORDER BY name";
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

            res.render('calendar_register_form',{
               start:start,
               end:end,
               start_msec:req.query.start,
               end_msec:req.query.end,
               customerList:customerList,
               memberList:memberList,
               work_type_list:work_type_List,
               undecided_reason_list:undecided_reason_list,
               manufacturer_list:manufacturer_list,
               name:req.session.user.name,
               final_correction_time:final_correction_time
            });
         });

      });

   });

});

router.post('/register', function(req, res){

   //file 이후 새로운 코드 써봄

   var form = new multiparty.Form();

   //parameter받아서 DB에 등록하고 다시 전체 일정의 캘린더를 불러와서 달력을 보여줌 - 등록하고 데이터를 전달 res.redirect할껀지, render해서 view의 ajax로 전부 처리할껀지 결정해야됨.
   //var start_date = new Date(parseInt(req.body.start_msec)).toISOString().split('T')[0];
   //var end_date = new Date(parseInt(req.body.end_msec-86400000)).toISOString().split('T')[0];
   //var end_date_fake = new Date(parseInt(req.body.end_msec)).toISOString().split('T')[0];

   var start_date = req.body.start_date;
   var end_date = req.body.end_date;
   var customer_no = parseInt(req.body.customer_no);
   // var chargerList =  req.body.charger;
   var chargerList = '';
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
   var state = '완료';
   var undecided_reason=req.body.undecided_reason;

   //170207추가된 부분
   var failure = '';
   var report_state = '';

   //170117 파일 업로드하면서 추가된 부분
   var file_path = [];

   //최종수정에 대한 정보 표시해주면서 추가된 내용
   var final_writer = req.session.user.name;
   var final_correction_time = new Date();
   final_correction_time =(final_correction_time.getMonth()+1)+'월 '+ final_correction_time.getDate() + '일 '+('0'+final_correction_time.getHours()).slice(-2)+':'+('0'+final_correction_time.getMinutes()).slice(-2);


   // get field name & value
   form.on('field',function(name,value){
      if(name=='start_date'){
         start_date=value;
      }else if(name=='end_date'){
         end_date=value;
      }else if(name=='customer_no'){
         customer_no=parseInt(value);
      }else if(name=='charger'){
         chargerList+=value+',';
      }else if(name=='manufacturer'){
         manufacturer=value;
      }else if(name=='work_type'){
         work_type=value;
      }else if(name=='equipment'){
         equipment=value;
      }else if(name=='serial_number'){
         serial_number=value;
      }else if(name=='work_detail'){
         work_detail=value;
      }else if(name=='work_delay'){
         work_delay=value;
      }else if(name=='visit_type_as' || name=='visit_type_RBDS'){
         visit_type=value;
      }else if(name=='revisit_count'){
         revisit_count=value;
      }else if(name=='changed_component'){
         changed_component=value;
      }else if(name == 'state_as' || name == 'state_RBDS'){
         state=value;
      }else if(name=='undecided_reason'){
         undecided_reason = value;
      }else if(name=='failure'){
         failure = value;
      }
   });

   // file upload handling
   form.on('part',function(part){
      var filename;
      var size;
      if (part.filename) {
         //filename = part.filename;
         var ex = part.filename.split('.')[1];
         var directory = Math.floor(Math.random() * 10) + 1;
         var rand = Math.floor(Math.random() * 1000000) + 1;
         filename = directory + '/'+req.session.user.id+rand+'.'+ex;
         size = part.byteCount;
      }else{
         part.resume();

      }

      //console.log("Write Streaming file :"+filename);
      var writeStream = fs.createWriteStream('public/schedule_image/'+filename);
      writeStream.filename = filename;
      //console.log('writestream : '+writeStream.filename);
      part.pipe(writeStream);

      part.on('data',function(chunk){
        // console.log(filename+' read '+chunk.length + 'bytes');
      });

      part.on('end',function(){
         //console.log(filename+' Part read complete');
         writeStream.end();
      });
      file_path.push(filename);
   });



   // track progress
   form.on('progress',function(byteRead,byteExpected){
      // console.log(' Reading total  '+byteRead+'/'+byteExpected);
   });

   form.parse(req);



   //file 이후 새로운 코드 써봄


   // all uploads are completed
   form.on('close',function(){
      //전송이 완료된 경우 DB access함.

      var tmp_arr = []; //방문자를 하나하나 담을 array

      //chargerList 맨 뒤의 ,를 제거해줌
      var split = chargerList.split(',');
      if(split.length<=2){
         chargerList = split[0];
         tmp_arr.push(chargerList);
      }else {
         chargerList = '';
         for (var i = 0; i < split.length - 2; i++) {
            chargerList += split[i] + ',';
            tmp_arr.push(split[i]);
         }
         chargerList += split[split.length - 2];
         tmp_arr.push(split[split.length-2]);
      }


      //신규 방문의 경우 재방문 횟수가 0임
      if(visit_type=="신규 방문"){
         revisit_count='0';
      };


//
      //if(typeof chargerList=='object'){
      //   var temp ='';
      //   for(var i=0;i<chargerList.length;i++){
      //      if(i==chargerList.length-1){
      //         temp += chargerList[i];
      //      }else{
      //         temp +=chargerList[i]+',';
      //      }
      //      tmp_arr.push(chargerList[i]);
      //   }
      //   chargerList = temp;
      //}else{
      //   tmp_arr.push(chargerList);
      //}


      var sql = "SELECT * FROM customer WHERE no="+customer_no;
      var customer = {};
      conn.query(sql, function(err, result){
         customer = result[0];
         var find_helper = "";
         for(var i=0;i<tmp_arr.length;i++) {
            if(i==tmp_arr.length-1) {
               find_helper += " id = '" + tmp_arr[i] + "'";
            } else {
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
               undecided_reason:undecided_reason,
               file_path:file_path.toString(),
               final_writer:final_writer,
               final_correction_time:final_correction_time,
               failure:failure,
               report_state:report_state
            };
            conn.query(sql3, schedule, function(err, result){

               res.redirect('/calendar');
            });
         });
      });
   });

});



router.get('/getAllSchedule', function(req , res){

   var start_range = new Date(req.query.start).toISOString().split('T')[0];
   var end_range = new Date(req.query.end).toISOString().split('T')[0]; //하루더 측정됨
   var sql = "SELECT * FROM schedule WHERE start_date <='" +end_range+"' AND end_date >= '"+start_range+"'";
   var scheduleList = [];
   conn.query(sql, function(err, result){
      scheduleList = result;
      var event_arr = [];

      for(var i=0;i<scheduleList.length;i++){
         var color="";
         if(scheduleList[i].state=='완료'){
            color="#5587ED";
         }else{
            color="#F15F5F";
         }
         //하루 더해줘야 됨 - 밀리초를 구해서 하루 더해주는 것
         var tmp_date = new Date(scheduleList[i].end_date);
         var tmp_time = tmp_date.getTime();
         var _end_date = new Date(tmp_time+86400000).toISOString().split('T')[0];


         var borderColor =  'white';
         //세션 비교 - 테두리 색상 넣어주기
         if(req.session.user.userType=='member'){
            if(scheduleList[i].charger.indexOf(req.session.user.id)!=-1){
               borderColor= 'black';
            };
         };

         var textColor = '#FFFFFF'; //default 흰색
         if(req.session.user.userType=='member'){
            if(scheduleList[i].charger.indexOf(req.session.user.id)!=-1){
               textColor= 'yellow';
            };
         };

         var manufac = scheduleList[i].manufacturer;
         if(manufac!=null && manufac!=undefined && manufac!=''){
            manufac = " "+manufac;
         }else{
            manufac = "";
         }


         event_arr.push({
            title:scheduleList[i].charger_name + " / " +scheduleList[i].customer_name + manufac,
            color:color,
            textColor : textColor,
            start : scheduleList[i].start_date,
            end : _end_date,
            no:scheduleList[i].no,
            borderColor:borderColor
         });
      }

      //공휴일 정보 입력
      var holiday_arr = [];
      holiday_arr = holiday.getHolidayArrays();
      for(var i=0;i<holiday_arr.length;i++){
         event_arr.push(holiday_arr[i]);
      }
      res.send(event_arr);

   });

});


//detail page
router.get('/getScheduleByNo', function(req, res){
   var start = req.query.start;
   var end = parseInt(req.query.end)-86400000;
   var start_date = new Date(parseInt(start)).toISOString().split('T')[0];
   var end_date = new Date(parseInt(end)).toISOString().split('T')[0];
   var end_date_fake = new Date(parseInt(parseInt(end)+86400000)).toISOString().split('T')[0];

   var no = req.query.no;

//거래처 리스트를 조회해오는
   var sql = "SELECT * FROM customer ORDER BY name";
   var customerList = [];
   conn.query(sql, function(err, result){
      customerList = result;

      //기술부 직원 리스트를 조회해오는
      var sql2 = "SELECT * FROM member ORDER BY name";
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

            var sql4 = "SELECT * FROM code WHERE code_type='업무구분' OR code_type='미결사유' OR code_type='제조사'";
            conn.query(sql4, function(err, result){
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
               var file_path = schedule.file_path;
               var file_path_arr= [];
               if(file_path!=null && file_path!=undefined && file_path!='') {
                  for (var i = 0; i < file_path.split(',').length; i++) {
                     file_path_arr.push(file_path.split(',')[i]);
                  }
               }

               res.render('calendar_modify_form',{name:req.session.user.name, schedule:schedule, customerList:customerList, memberList:memberList, start:start_date, end:end_date, start_msec:req.query.start, end_msec:req.query.end, end_date_fake:end_date_fake, customerList:customerList, memberList:memberList, work_type_list:work_type_List, undecided_reason_list:undecided_reason_list, manufacturer_list:manufacturer_list, file_path_arr:file_path_arr});
            });

         });

      });

   });

});



//수정
router.post('/modify', function(req, res) {

   var form = new multiparty.Form();//multipart form을 조회해오기 위한 객체

   var no = req.body.no;
   var start_date = req.body.start_date;
   var end_date = req.body.end_date;
   var customer_no = parseInt(req.body.customer_no);
   var chargerList = req.body.charger;
   var manufacturer = req.body.manufacturer;
   var work_type = req.body.work_type;
   var equipment = req.body.equipment;
   var serial_number = req.body.serial_number;
   var work_detail = req.body.work_detail;
   var work_delay = req.body.work_delay;

   var visit_type = req.body.visit_type;
   var revisit_count = req.body.revisit_count;
   var changed_component = req.body.changed_component;
   var state = '완료';//내근의 경우 라디오 버튼 선택창이 없으므로
   var undecided_reason = req.body.undecided_reason;

   //170207 추가된 부분
   var failure = '';
   var report_state = '';

   //170118 파일 업로드하면서 추가된 부분
   var file_path = [];
   var tmp_path = []; //input type=hidden으로 넘어온 filename을 담고있는 array

   chargerList='';

   //최종수정한 사람과 시간 알아야되면서 추가한 부분
   var final_writer = req.session.user.name;
   var final_correction_time = new Date();
   final_correction_time =(final_correction_time.getMonth()+1)+'월 '+ final_correction_time.getDate() + '일 '+('0'+final_correction_time.getHours()).slice(-2)+':'+('0'+final_correction_time.getMinutes()).slice(-2);



   // get field name & value
   form.on('field', function (name, value) {

      if (name == 'start_date') {
         start_date = value;
      } else if (name == 'end_date') {
         end_date = value;
      } else if (name == 'customer_no') {
         customer_no = parseInt(value);
      } else if (name == 'charger') {
         chargerList += value + ',';
      } else if (name == 'manufacturer') {
         manufacturer = value;
      } else if (name == 'work_type') {
         work_type = value;
      } else if (name == 'equipment') {
         equipment = value;
      } else if (name == 'serial_number') {
         serial_number = value;
      } else if (name == 'work_detail') {
         work_detail = value;
      } else if (name == 'work_delay') {
         work_delay = value;
      } else if (name=='visit_type_as' || name=='visit_type_RBDS') {
         visit_type = value;
      } else if (name == 'revisit_count') {
         revisit_count = value;
      } else if (name == 'changed_component') {
         changed_component = value;
      } else if (name == 'state_as' || name == 'state_RBDS') {
         state = value;
      } else if (name == 'undecided_reason') {
         undecided_reason = value;
      } else if (name.indexOf('file')!=-1){
         //console.log('file form으로부터 하나 읽음 ');
      } else if (name == 'no'){
         no = value;
      }else if(name=='failure'){
         failure = value;
      }
   });


   // file upload handling
   form.on('part', function (part, name) {

      var filename;
      var size;
      if (part.filename) {
         //filename = part.filename;
         var ex = part.filename.split('.')[1];
         var directory = Math.floor(Math.random() * 10) + 1;
         var rand = Math.floor(Math.random() * 1000000) + 1;
         filename = directory + '/'+req.session.user.id+rand+'.'+ex;
         size = part.byteCount;
      }else{
         part.resume();

      }


      // //파일 받을 때
      // var filename;
      // var size;
      //
      // var flag = false;
      //
      // if (part.filename) {
      //    checkDirectory(part.filename, function(error) {
      //       if(error) {
      //          console.log("oh no!!!", error);
      //       } else {
      //          //Carry on, all good, directory exists / created.
      //          flag=true;
      //       }
      //    });
      //
      //
      //    //filename = part.filename;
      //    var ex = part.filename.split('.')[1];
      //    var directory = Math.floor(Math.random() * 10) + 1;
      //    var rand = Math.floor(Math.random() * 1000000) + 1;
      //
      //    if(flag){
      //
      //       filename=part.filename;
      //       console.log('flag가 true : '+filename);
      //    }else{
      //       filename = directory + '/' + req.session.user.id + rand + '.' + ex;
      //       console.log('flag가 false : '+filename);
      //    }
      //
      //    size = part.byteCount;
      // } else {
      //    part.resume();
      // }

      //console.log("Write Streaming file :" + filename);
      var writeStream = fs.createWriteStream('public/schedule_image/' + filename);
      writeStream.filename = filename;
      //console.log('writestream : ' + writeStream.filename);
      part.pipe(writeStream);

      part.on('data', function (chunk) {
       //  console.log(filename + ' read ' + chunk.length + 'bytes');
      });

      part.on('end', function () {
         //console.log(filename + ' Part read complete');
         writeStream.end();
      });

      file_path.push(filename);

   });


   // track progress
   form.on('progress', function (byteRead, byteExpected) {
      //console.log(' Reading total  ' + byteRead + '/' + byteExpected);
   });

   form.parse(req);


   //file 이후 새로운 코드 써봄


   // all uploads are completed
   form.on('close', function () {
      //전송이 완료된 경우 DB access함.
      var tmp_arr = []; //방문자를 하나하나 담을 array

      //chargerList 맨 뒤의 ,를 제거해줌
      var split = chargerList.split(',');
      if(split.length<=2){
         chargerList = split[0];
         tmp_arr.push(chargerList);
      }else {
         chargerList = '';
         for (var i = 0; i < split.length - 2; i++) {
            chargerList += split[i] + ',';
            tmp_arr.push(split[i]);
         }
         chargerList += split[split.length - 2];
         tmp_arr.push(split[split.length-2]);
      }

      //신규 방문의 경우 재방문 횟수가 0임
      if (visit_type == "신규 방문") {
         revisit_count = '0';
      };

      //var tmp_arr = [];
//
      //if(typeof chargerList=='object'){
      //   var temp ='';
      //   for(var i=0;i<chargerList.length;i++){
      //      if(i==chargerList.length-1){
      //         temp += chargerList[i];
      //      }else{
      //         temp +=chargerList[i]+',';
      //      }
      //      tmp_arr.push(chargerList[i]);
      //   }
      //   chargerList = temp;
      //}else{
      //   tmp_arr.push(chargerList);
      //}


      var sql = "SELECT * FROM customer WHERE no=" + customer_no;
      var customer = {};
      conn.query(sql, function (err, result) {
         customer = result[0];
         var find_helper = "";
         for (var i = 0; i < tmp_arr.length; i++) {
            if (i == tmp_arr.length - 1) {
               find_helper += " id = '" + tmp_arr[i] + "'";
            } else {
               find_helper += " id = '" + tmp_arr[i] + "' OR";
            }
         }
         var sql2 = "SELECT * FROM member WHERE" + find_helper;
         var chargerArray = [];
         conn.query(sql2, function (err, result) {
            chargerArray = result;
            var charger_name_string = "";
            for (var k = 0; k < chargerArray.length; k++) {
               if (k == chargerArray.length - 1) {
                  charger_name_string += chargerArray[k].name;
               } else {
                  charger_name_string += chargerArray[k].name + ",";
               }
            }

            var sql3 = "UPDATE schedule SET ? WHERE no=" + no;

            var schedule = {
               start_date: start_date,
               end_date: end_date,
               customer_no: customer_no,
               customer_name: customer.name,
               charger: chargerList,
               charger_name: charger_name_string,
               manufacturer: manufacturer,
               work_type: work_type,
               equipment: equipment,
               serial_number: serial_number,
               work_detail: work_detail,
               work_delay: work_delay,
               visit_type: visit_type,
               revisit_count: revisit_count,
               changed_component: changed_component,
               state: state,
               undecided_reason: undecided_reason,
               final_writer:final_writer,
               final_correction_time:final_correction_time,
               file_path:file_path.toString(),
               failure:failure,
               report_state:report_state
            };

            conn.query(sql3, schedule, function (err, result) {
               res.redirect('/calendar');
            });
         });//conn.query - sql2
      });//conn.query - sql
   });
});

//일정 삭제
router.get('/delete', function(req, res){
   var no = req.query.no;
   var sql = "DELETE FROM schedule WHERE no="+no;
   conn.query(sql, function(err, result){
      res.redirect('/calendar');
   });
});


//event drop
router.get('/dropEvent', function(req, res){
   var no = req.query.no;
   var start = req.query.start;
   var end = req.query.end;
   var copyOrMove = req.query.copyOrMove;
   start = new Date(parseInt(start)).toISOString().split('T')[0];
   end = new Date(parseInt(end)-86400000).toISOString().split('T')[0];

   //최종수정한 사람과 시간 알아야되면서 추가한 부분
   var final_writer = req.session.user.name;
   var final_correction_time = new Date();
   final_correction_time =(final_correction_time.getMonth()+1)+'월 '+ final_correction_time.getDate() + '일 '+('0'+final_correction_time.getHours()).slice(-2)+':'+('0'+final_correction_time.getMinutes()).slice(-2);

   if(copyOrMove == 'move') {
      var sql = "UPDATE schedule SET start_date='" + start + "', end_date='" + end + "', final_writer='" + final_writer + "', final_correction_time='" + final_correction_time + "' WHERE no=" + no;

      conn.query(sql, function (err, result) {
         res.send();
      });
   } else {

      var sql = "SELECT * FROM schedule WHERE no='" + no + "'";
      var schedule = {};
      conn.query(sql, function (err, result) {
         schedule = result[0];
         schedule.start_date = start;
         schedule.end_date = end;
         schedule.final_writer = final_writer;
         schedule.final_correction_time = final_correction_time;

         delete schedule.no;

         var sql2 = "INSERT INTO schedule SET ?";
         conn.query(sql2, schedule, function (err, result) {
            res.redirect('/');
         });
      });
   }
});



//report 불러오는 폼
router.get('/reportForm', function(req, res){
   var no = req.query.no;
   var sql = "SELECT * FROM schedule WHERE no="+no;
   var schedule = {};
   conn.query(sql, function(err, result){
      schedule = result[0];
         res.render("calendar_report_form",{
            name:req.session.user.name,
            schedule:schedule
         });
   });
});

//report 메일 발송
router.post('/sendReport', function(req, res){
   var report_state = 'send';
   var no = req.body.no;
   var sql = "UPDATE schedule SET report_state='"+report_state+"' WHERE no="+no;

   //input list
   var subject = req.body.subject;
   var sender = req.body.sender;
   var sender_department = req.body.sender_department;
   var write_date = req.body.write_date;
   var inspection_start_date = req.body.inspection_start_date;
   var inspection_end_date = req.body.inspection_end_date;
   var writer = req.body.writer;
   var writer_phone = req.body.writer_phone;
   var customer_name = req.body.customer_name;
   var receiver = req.body.receiver;
   var receiver_phone = req.body.receiver_phone;
   var equipment = req.body.equipment;
   var place= req.body.place;
   var failure = req.body.failure;
   var work_detail = req.body.work_detail;
   var email = req.body.email;

   if(equipment==null || equipment==undefined || equipment.toString().trim()==''){
      equipment = '없음';
   }


   //form
   mailOptions.to = email;
   mailOptions.subject = '[(주)우정비에스씨]고객님의 A/S 정비소견서입니다.';
   mailOptions.html =
            '<div align="center">' +
            '<div align="left" style="border-bottom:2px solid black"><font size="4">제    목 : '+subject+'</font></div>'+
            '<br><br>' +
            '<div align="left"><font size="4">&nbsp;&nbsp;&nbsp;1. 귀사의 무궁한 발전을 기원합니다.</font></div><br><br><br>'+
            '<div align="left"><font size="4">&nbsp;&nbsp;&nbsp;2. 다음과 같이 당사에서 점검한 장비에 대해 조치 내용을 드리오니 업무에 참조하시기 바랍니다.</font></div><br>'+
               '<font size="3"><h1>정 비 소 견 서</h1></font>'+
               '<table border="1" align="center" cellpadding="5" cellspacing="0" width="800px" style="border-collapse:collapse;position:relative;border:1px solid black">'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray" width="100px">발 신 인</td>'+
               '<td width="200px">'+sender+'</td>'+
               '<td align="center" style="background-color: lightgray" width="100px">발신부서</td>'+
               '<td width="200px">'+sender_department+'</td>'+
               '</tr>'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray">작성일자</td>'+
               '<td>'+write_date+'</td>'+
               '<td align="center" style="background-color: lightgray">점검일자</td>'+
               '<td>'+inspection_start_date+' ~ '+inspection_end_date+'</td>'+
               '</tr>'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray">작 성 자</td>'+
               '<td>'+writer+'</td>'+
               '<td align="center" style="background-color: lightgray">연락처</td>'+
               '<td>'+writer_phone+'</td>'+
               '</tr>'+
               '<tr height="30px">' +
               '<td align="center" style="background-color: lightgray">수 신 인</td>'+
               '<td colspan="3">'+customer_name+'</td>'+
               '</tr>'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray">참  조</td>'+
               '<td>'+receiver+'</td>'+
               '<td align="center" style="background-color: lightgray">연락처</td>'+
               '<td>'+receiver_phone+'</td>'+
               '</tr>'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray">장비명</td>'+
               '<td>'+equipment+'</td>'+
               '<td align="center" style="background-color: lightgray">설치 장소</td>'+
               '<td>'+place+'</td>'+
               '</tr>'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray">알람 내용</td>'+
               '<td colspan="3">'+failure+'</td>'+
               '</tr>'+
               '</tr>'+
               '<tr height="50px">'+
               '<td align="center" style="background-color: lightgray">점검 결과</td>'+
               '<td colspan="3">'+work_detail+'</td>'+
               '</tr>'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray">BEFORE</td>'+
               '<td colspan="3"><img width="600px" height="400px" src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com/images/inspection.jpg"></td>'+
               '</tr>'+
               '<tr height="30px">'+
               '<td align="center" style="background-color: lightgray">AFTER</td>'+
               '<td colspan="3"><img width="600px" height="400px" src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com/images/inspection.jpg"></td>'+
               '</tr>'+
               '</table><br>'+
            '</div>';

         transporter.sendMail(mailOptions, function (err, result) {
            if (err) {
               return console.log(err);
            }else{
               conn.query(sql, function(err,result){
                  res.redirect('/calendar');
               });

            }
         });

});


module.exports = router;