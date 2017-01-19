/**
 * Created by daeyoung on 2017-01-05.
 */
var express = require('express');
var router = express.Router();

//nodemailer
var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport('smtps://cscenterwoojung:woojung8302@smtp.gmail.com');

var mailOptions = {
    from: 'cscenterwoojung@gmail.com',
    to: '',
    subject: '',
    html: '',
    attachments:[]
};


router.get('/createForm', function (req, res) {
    if(req.session.user==undefined){
        res.redirect('/?errorMessage=login_requirement');
    };

    res.render('inspection_create_form', {});
});

router.post('/send', function (req, res) {
    var no = req.body.no;
    var receiver = req.body.receiver;
    var equipAndserialNum = req.body.equipAndserialNum;
    var lastInspectionDate = req.body.lastInspectionDate;
    var nextInspectionDate = req.body.nextInspectionDate;
    var inspectionPeriod = req.body.inspectionPeriod;

    var customer_email = req.body.customer_email;

    mailOptions.to = customer_email;
    mailOptions.subject = '[(주)우정비에스씨]검교정 안내 메일입니다.';
    mailOptions.html =
    '<font face="맑은고딕">'+
    '<div style="position:relative;width:50%;left:25%" algin="center">' +
        '<table style="border-collapse: collapse;">' +
            '<tr>' +
                '<td>교정번호</td>'+
                '<td>'+no+'</td>'+
                '<td rowspan="2"><img align="right" src="http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/inspection_woojunglogo.jpg"></td>'+
            '</tr>'+
            '<tr>'+
                '<td style="height:40px;border-top:1px solid black;"></td>'+
                '<td style="height:40px;border-top:1px solid black;"></td>'+
            '</tr>'+
            '<tr style="border-top: 2px solid black">'+
                '<td >제 목</td>'+
                '<td style="position:relative;left:-14%;">Bioquell 과산화수소 증기 멸균기(HPV)의 검교정(Calibration) 일자 공지 안내문</td>'+
                '<td></td>'+
            '</tr>'+
            '<tr>'+
                '<td>수 신</td>'+
                '<td style="position:relative;left:-14%;">'+receiver+'</td>'+
                '<td></td>'+
            '</tr>'+
            '<tr>'+
                '<td style="border-bottom: 2px solid black;">발 신</td>'+
                '<td style="position:relative;left:-14%;border-bottom:2px solid black;">(주)우정비에스씨 기술부 벨리데이션팀</td>'+
                '<td style="border-bottom: 2px solid black;"></td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3" style="height:30px"></td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3">귀사의 무궁한 발전을 기원합니다.</td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3" style="height:10px"></td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3">저희 제품을 항상 애용해 주셔서 감사합니다.</td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3" style="height:10px"></td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3">사용하시고 계신 과산화수소 증기 멸균기의 검교정 기일이 만료 예정에 있어, 이에 대한 안내를 드리고자 합니다. 과산화수소증기 멸균기의 유지보수와 안전한 사용을 위해 1년에 한번의 검교정을 추천하고 있습니다. 현재 보유하고 계신 장비의 현황과 검교정 예정일을 안내드리오니, 진행여부 결정하신 후 희망 검교정 예정일 6주 전에 첨부되어있는 검교정 신청서를 제출해주시면 안내 드리도록 하겠습니다.</td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3" style="height:10px"></td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3">고객 여러분들의 신뢰에 보답할 수 있도록 서비스와 유지관리를 위해 앞으로도 최선을 다하도록 하겠습니다.</td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3" style="height:10px"></td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3">감사합니다.</td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3" style="height:10px"></td>'+
            '</tr>'+
            '<tr>'+
                '<td colspan="3" style="height:10px" align="center"><b>&lt;&nbsp;아&nbsp;&nbsp;래&nbsp;&gt;</b></td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:30px"></td></tr>'+
            '<tr>'+
                '<td colspan="3"><b>1. 보유 장비 정보</b></td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:30px"></td></tr>'+
            '<tr>'+
                '<td style="width:25%"><span style="position:relative;left:10%">1) 장비 모델명/SN# : </span></td>'+
                '<td colspan="2">'+equipAndserialNum+'</td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:10px"></td></tr>'+
            '<tr>'+
                '<td style="width:25%"><span style="position:relative;left:10%">2) 마지막 검교정일 : </span></td>'+
                '<td colspan="2">'+lastInspectionDate+'</td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:10px"></td></tr>'+
            '<tr>'+
                '<td style="width:25%"><span style="position:relative;left:10%">3) 차기 검교정일 &nbsp;&nbsp;&nbsp;&nbsp;: </span></td>'+
                '<td colspan="2">'+nextInspectionDate+'</td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:10px"></td></tr>'+
            '<tr>'+
                '<td style="width:25%"><span style="position:relative;left:10%">4) 검교정 주기 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </span></td>'+
                '<td colspan="2">'+inspectionPeriod+'</td></td>'+
            '</tr>'+
        //여기서부터
            '<tr><td colspan="3" style="height:40px"></td></tr>'+
            '<tr>'+
                '<td colspan="3"><b>2. 문의처</b></td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:30px"></td></tr>'+
            '<tr>'+
                '<td style="width:25%"><span style="position:relative;left:10%">1) 담당팀 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </span></td>'+
                '<td colspan="2">(주)우정비에스씨 기술부 벨리데이션팀</td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:10px"></td></tr>'+
            '<tr>'+
                '<td style="width:25%"><span style="position:relative;left:10%">2) 연락처 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: </span></td>'+
                '<td colspan="2"><b>1522-1277</b> (우정콜센터)</td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:30px"></td></tr>'+
            '<tr>'+
                '<td colspan="3"><b><i>※ 검교정 완료 후 제출문서 : 교정 성적서, Test 결과 보고서</i></b></td>'+
            '</tr>'+
            '<tr><td colspan="3" style="height:30px"></td></tr>'+
            '<tr>'+
                '<td colspan="3">첨부 1. 검교정 신청서</td>'+
            '</tr>'+
    '   </table>'+
    '</div>'+
    '</font>';
    mailOptions.attachments=[
        {
            filename:'asd.png',
            path:'http://ec2-52-79-148-200.ap-northeast-2.compute.amazonaws.com:3000/images/asd.png'
        }
    ];


    transporter.sendMail(mailOptions, function (err, result) {
        if (err) {
            return console.log(err);
        }
        res.render('main', {});
    });
});


module.exports = router;