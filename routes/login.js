/**
 * Created by daeyoung on 2016-12-27.
 */
var express = require('express');
var router = express.Router();

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


/* GET home page. */
router.get('/', function(req, res){
    if(req.session.user==undefined){
        res.redirect('/?errorMessage=login_requirement');
    };

    var pagingBean = {
        current_page:'1',
        current_pageGroup:'1'
    };
    req.session.pagingBean = pagingBean;
    req.session.searchingBean = null;
  res.render('main',{name:req.session.user.name});
});


router.post('/', function(req, res) {

    var userType = req.body.userType;//admin or member

    var id = req.body.id;
    var password = req.body.password;
    var user = {
        id: id,
        password: password,
        userType:userType,
        name:''
    };

    if(userType=='member') {
        var sql = 'SELECT * FROM member';
    }else{
        sql = 'SELECT * FROM admin';
    }
        conn.query(sql, function (err, result) {
            var data = result;
            if(userType != 'member'){
                if (id == data[0].id) {
                    if (password == data[0].password) {
                        var pagingBean = {
                            current_page:1,
                            current_pageGroup:1
                        };
                        user = data[0];
                        req.session.user = user;
                        req.session.pagingBean = pagingBean;
                        res.render('main', {name:user.name});

                    } else {
                        res.redirect('/?errorMessage=pwd');
                    }
                } else {
                    res.redirect('/?errorMessage=id');
                }

            }else{
                //member login
                var flag = 'id'; //default : 실패
                for(var i=0;i<data.length;i++){
                    if (id == data[i].id) {
                        if (password == data[i].password) {
                            var pagingBean = {
                                current_page:1,
                                current_pageGroup:1
                            };
                            user = data[i];
                            req.session.user = user;
                            req.session.pagingBean = pagingBean;
                            flag= 'success';
                            break;
                        } else {
                            flag='pwd'
                        }
                    }
                }

                if(flag=='success'){
                    res.render('main', {name:user.name});
                    return;
                }else if (flag=='id'){
                    res.redirect('/?errorMessage=id');
                    return;
                }else {
                    res.redirect('/?errorMessage=pwd');
                    return;
                }
            }
        });
});


router.get('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});


router.post('/logout', function(req, res){
    req.session.destroy();
    res.redirect('/');
});

module.exports = router;
