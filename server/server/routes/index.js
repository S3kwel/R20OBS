'use strict';
var express = require('express');
var router = express.Router();
var chat = require('.//chat.js'); 

/* GET home page. */
router.post('/', function (req, res) {
    res.send(chat.sendMessage(req.body,res));
});

router.post('/render', function (req, res) {
    console.log(req); 

    //res.send(chat.addMessage(req, res));
});

router.get('/render', function (req, res) {
    res.render('chatBox');
});

//router.get('/', function (req, res) {
//    res.render('index', { title: 'Express', "data": req.body });
//});

module.exports = router;
