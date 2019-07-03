'use strict';
var express = require('express');
var router = express.Router();
var chat = require('.//chat.js'); 
const bodyParser = require('body-parser');
var jsonParser = bodyParser.json();


/* GET home page. */
router.post('/', function (req, res) {
    res.send(chat.sendMessage(req.body,res));
});

router.post('/render',jsonParser, function (req, res) {
    res.send(chat.addMessage(req, res));
});

router.get('/', function (req, res) {
    var r = res; 
    res.render('chatBox', { title: 'Express', "data": req.body }, function (err,html) {
        chat.prepBox(err, html,r); 
    });
});

//router.get('/', function (req, res) {
//    res.render('index', { title: 'Express', "data": req.body });
//});

module.exports = router;
