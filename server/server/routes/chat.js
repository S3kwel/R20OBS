'use strict';
var express = require('express');
var router = express.Router();
var request = require('request'); 
var sqlite3 = require('sqlite3').verbose();
var fs = require('fs'); 

//Check for the database file.  If it doesn't exist, copy the template.  
let dbpath = './chat.db'; 
let templateDB = './newchat.db';

if(fs.existsSync(dbpath)){
    console.log("Found existing chats database.");
}
else{
    console.log("No chat database found, creating..."); 
    fs.copyFileSync(templateDB,dbpath); 
    console.log("created."); 
}
//':memory:' appears to assign the db to memory.  
var db = new sqlite3.Database(dbpath);

//Accepts the rendered output and passes it to the chat page.
function renderHandler(err,html){
    request.post({ headers: {'content-type' : 'text/plain'}
               , url: `http://localhost:1337/render`, body: html }
               , function(error, response, body){
                console.log(body); 
    }); 
        
   
    
}

//To pass just the JSON
function addChat(data){
    console.log("ADDCHAT"); 
    request.post({ headers: {'content-type' : 'application/json'}
               , url: `http://localhost:1337/render`, body: JSON.stringify(data) }
               , function(error, response, body){
                console.log(body); 
    }); 
        
   
    
}


//data.body should have an html string of the message to add.  
//Add this information to a database, have the 'get' version of this page render upon an update? 
//Postgres via express? 
function addMessage(data,res){
   data = data.body; 
  var ins = db.prepare(`INSERT INTO chats VALUES (CURRENT_TIMESTAMP,"${data.id}","${data.avatar}","${data.content}")`);
  ins.run();
  ins.finalize(); 

  db.each('SELECT rowid AS id, * FROM chats', function (err, row) {
    console.log(row)
  }); 
}


//NOTE:  Giving a callback to res.render interrupts the standard output. 
function sendMessage(data,res) {
    console.log("SENDMESSAGE");
    addChat(data);  
        

    //TO USE TEMPLATES.
    //res.render('chat', data, function(err,html){
    //    renderHandler(err,html); 
    //});
}

module.exports = {
    sendMessage: sendMessage,
    addMessage: addMessage
}