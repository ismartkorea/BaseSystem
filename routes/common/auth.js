const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const config = require('./dbconfig');
const mysql = require('mysql');
const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({extended:false}));
router.use(methodOverride("_method"));
router.use(flash());


/**
 * 서비스 권한 조회
 * payNo : 결제번호, pNo : 상품번호, pName : 상품명
 * useTermDays : 서비스이용기간 : 30일, 365일
 * dtCnt : 남은 서비스일
 * optUseCnt : 옵션서비스 갯수
 * opt1UseYn : 욥션1(APP170109ASS1:자료실) 서비스 사용여부
 * opt2UseYn : 욥션2(APP170109ASS2:분석) 서비스 사용여부
 * opt3UseYn : 욥션3(APP170109ASS3:원격) 서비스 사용여부
 */
router.get('/:usrId', function(req, res, next) {

    let usrId = req.params.usrId !=null ? req.params.usrId : '';

    let SQL = 'SELECT x.order_no as payNo, y.p_code as pNo, y.p_nm as pName, x.use_term_days as useTermDays, DATEDIFF(ADDDATE(x.pay_date, x.use_term_days), now()) as dtCnt, x.expire_yn as expireYn,'
        + ' (SELECT COUNT(a.order_no) FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_uniq_code = "ASS1" AND a.p_div = "O" AND b.usr_id = ?) as optUseCnt,'
        + ' (SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170109ASS1" AND a.p_div = "O" AND b.usr_id = ?) as opt1UseYn,'
        + ' (SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170109ASS2" AND a.p_div = "O" AND b.usr_id = ?) as opt2UseYn,'
        + ' (SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170109ASS3" AND a.p_div = "O" AND b.usr_id = ?) as opt3UseYn'
        + ' FROM pay_info_tbl x, order_detail_inf_tbl y WHERE x.order_no = y.order_no AND y.p_code = "APP170109ASS"'
        + ' AND x.usr_id = ? ORDER BY x.insert_dt DESC LIMIT 1;';

    if(usrId == '') {
        res.status(404).json({'result' : 'fail', 'err' : 'No user Id'});
    } else {
        const conn = mysql.createConnection(config);
        conn.connect();
        conn.query(SQL,
            [usrId, usrId, usrId, usrId, usrId],
            function(err, results) {
                if(err) {
                    console.log('err : ', err);
                    //res.status(500).json({'result' : 'fail', 'err' : err});
                    res.json({'result' : false, code: 404, 'desc' : 'no used service'});
                } else {
                    //res.status(200).json({'result' : 'success', 'count' : results.length, 'data' : JSON.parse(results)});
                    if (results.length) {
                        res.json({'result': true, code: 200, 'desc': 'success', 'data': results[0]});
                    }
                    else {
                        res.json({'result': true, code: 302, 'desc': 'no data'});
                    }
                }
            }
        );
        conn.end();
    }

});


/**
 * 판독기 권한조회 처리.
 */
router.post('/vdtcli', function(req, res, next) {

  if ("" == req.body.userid) {
    console.log("userid parameter empty");
    res.json({'result': false, code: 500, 'desc': 'userid field is not defined'});
    return ;
  }

  let usrId = req.body.userid;
  console.log("userid: " + usrId);

  let SQL = 'SELECT x.order_no as payNo, y.p_code as pNo, y.p_nm as pName,'
    + '(SELECT COUNT(a.order_no) FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_uniq_code = "ASS2" AND a.p_div = "O" AND b.pay_result = "paid" AND b.expire_yn = "N" AND b.usr_id = ?) as optUseCnt,'
    + '(SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170911VDT1" AND a.p_div = "O" AND b.pay_result = "paid" AND b.expire_yn = "N" AND b.usr_id = ?) as opt1UseYn,'
    + '(SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170911VDT2" AND a.p_div = "O" AND b.pay_result = "paid" AND b.expire_yn = "N" AND b.usr_id = ?) as opt2UseYn,'
    + '(SELECT "" as opt3_use_yn FROM dual) as opt3UseYn,'
    + 'x.expire_yn as expireYn FROM pay_info_tbl x, order_detail_inf_tbl y WHERE x.order_no = y.order_no AND y.p_code = "APP170911VDT"'
    + 'AND x.pay_result = "paid" AND x.expire_yn = "N" AND x.usr_id = ? ORDER BY x.insert_dt DESC;';

  const conn = mysql.createConnection(config);
  conn.connect();
  conn.query(SQL,
    [usrId, usrId, usrId, usrId],
    function (err, results) {
      if (err) {
        console.log('err : ', err);
        res.json({'result' : false, code: 404, 'desc' : 'no user id'});
      } else {
        if (results.length) {
          res.json({'result': true, code: 200, 'desc': 'success', 'data': results[0]});
        }
        else {
          res.json({'result': true, code: 302, 'desc': 'no data'});
        }
      }
    }
  );
  conn.end();

});

/**
 * 서비스 권한 조회
 * payNo : 결제번호, pNo : 상품번호, pName : 상품명
 * useTermDays : 서비스이용기간 : 30일, 365일
 * dtCnt : 남은 서비스일
 * optUseCnt : 옵션서비스 갯수
 * opt1UseYn : 욥션1(APP170109ASS1:자료실) 서비스 사용여부
 * opt2UseYn : 욥션2(APP170109ASS2:분석) 서비스 사용여부
 * opt3UseYn : 욥션3(APP170109ASS3:원격) 서비스 사용여부
 */
router.post('/', function(req, res, next) {

    let usrId = req.body.usrId !=null ? req.body.usrId : '';

    const SQL = 'SELECT x.order_no as payNo, y.p_code as pNo, y.p_nm as pName, x.use_term_days as useTermDays, DATEDIFF(ADDDATE(x.pay_date, x.use_term_days), now()) as dtCnt, x.expire_yn as expireYn,'
            + ' (SELECT COUNT(a.order_no) FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_uniq_code = "ASS1" AND a.p_div = "O" AND b.usr_id = ?) as optUseCnt,'
            + ' (SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170109ASS1" AND a.p_div = "O" AND b.usr_id = ?) as opt1UseYn,'
            + ' (SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170109ASS2" AND a.p_div = "O" AND b.usr_id = ?) as opt2UseYn,'
            + ' (SELECT CASE WHEN COUNT(a.order_no) = 0 THEN "N" WHEN COUNT(a.order_no) > 0 THEN "Y" ELSE "N" END  FROM order_detail_inf_tbl a, pay_info_tbl b WHERE a.order_no = b.order_no AND a.p_code = "APP170109ASS3" AND a.p_div = "O" AND b.usr_id = ?) as opt3UseYn'
            + ' FROM pay_info_tbl x, order_detail_inf_tbl y WHERE x.order_no = y.order_no AND y.p_code = "APP170109ASS"'
            + ' AND x.usr_id = ? ORDER BY x.insert_dt DESC LIMIT 1;';

    if(usrId == '') {
        res.status(404).json({'result' : 'fail', 'err' : 'No user Id'});
    } else {
        const conn = mysql.createConnection(config);
        conn.connect();
        conn.query(SQL,
            [usrId, usrId, usrId, usrId, usrId],
            function(err, results) {
                if(err) {
                    console.log('err : ', err);
                    //res.status(500).json({'result' : 'fail', 'err' : err});
                    res.json({'result' : false, code: 404, 'desc' : 'no used service'});
                } else {
                    //res.status(200).json({'result' : 'success', 'count' : results.length, 'data' : JSON.parse(results)});
                    if (results.length) {
                        res.json({'result': true, code: 200, 'desc': 'success', 'data': results[0]});
                    }
                    else {
                        res.json({'result': true, code: 302, 'desc': 'no data'});
                    }
                }
            }
        );
        conn.end();
    }

});

module.exports = router;