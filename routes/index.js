var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log('### index 처리 ###');
  var ss = req.session;

  if(ss==null) {
      res.redirect('/login');
  } else {
      res.render('./index', {title: '메인 화면', session : ss});
  }

});

module.exports = router;
