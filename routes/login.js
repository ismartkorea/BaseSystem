const express = require('express');
//const bodyParser = require('body-parser');
//const methodOverride = require('method-override');
//const flash = require('connect-flash');
const mysql = require('mysql');
const config = require('./common/dbconfig');
const conn = mysql.createConnection(config);
//router.use(bodyParser.json());
//router.use(bodyParser.urlencoded({extended:false}));
//router.use(methodOverride("_method"));
//router.use(flash());
const router = express.Router();

// login 폼 호출.
router.get('/', (req, res, next) => {
    console.log('### 로그인 화면 호출 ###');
    var ss = req.session;

    if(ss==null) {
        res.render('./login', {title: '로그인 화면', session : ss});
    } else {
        res.render('./index', {title: '메인 화면', session : ss});
    }

});

router.post('/process', (req, res, next) => {
    console.log('### 로그인 처리 ###');
    var ss = req.session;
  
    let usrId = req.body.usrId;
    let usrPwd = req.body.usrPwd;
    console.log("session : " + JSON.stringify(ss));

    let rUsrId = ''; let rRet = '';
    let SQL1 = 'SELECT id as id, AES_DECRYPT(UNHEX(pwd),"hibiznet") as pwd,';
    SQL1 += ' name as name, email as email, telno as telNo';
    SQL1 += ' FROM user_info_tbl WHERE id = ?';
    SQL1 += ' AND AES_DECRYPT(UNHEX(pwd),"hibiznet") = ?;';

    conn.query(SQL1,
        [usrId, usrPwd],
        function (err1, results1) {
            if (err1) {
                console.log('error2 : ', JSON.stringify(err1));
                res.status(500).json({error: err1});
            } else {
                if (results1[0] != null) {
                    // 세션 저장.
                    ss.usrId = results1[0].id;
                    ss.usrName = results1[0].name;
                    ss.usrEmail = results1[0].email;
                    ss.usrTelNo = results1[0].telNo;
                    ss.usrIp = ipAddress;
                    rUsrId = results1[0].id;

                   rRet = 'OK';
                } else {
                   rRet = 'NO';
                }

                res.status(200).json({title : rTitle, result : rRet,  session : ss});

            } // end else if
        });

});


module.exports = router;
