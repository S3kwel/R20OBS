'use strict';
var express = require('express');
var router = express.Router();
var request = require('request'); 

//Accepts the rendered output and passes it to the chat page.
function renderHandler(err,html){
    var html = html; 
    var clientServerOptions = {
        uri: `http://localhost:1337/render`,
        body: JSON.stringify(html),
        method: 'POST'
    }

    console.log(clientServerOptions); 
    request(clientServerOptions);    
    
}

function addMessage(data,res){
    console.log(data.body); 
}


//NOTE:  Giving a callback to res.render interrupts the standard output. 
function sendMessage(data,res) {
    console.log(Object.keys(data)); 
    res.render('chat', data, function(err,html){
        renderHandler(err,html); 
    });
}

module.exports = {
    sendMessage: sendMessage,
    addMessage: addMessage
}