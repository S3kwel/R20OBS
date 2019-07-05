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
var db = new sqlite3.Database(dbpath);

/**
 * Adds a json object to the database.
 * @param {object} data a JSON object corresponding to the fields you wish to insert into.  
 */
function addChat(data){
    console.log("ADDCHAT"); 
    request.post({
        headers: { 'content-type': 'application/json' }
        , url: `http://localhost:${process.env.PORT}/render`, body: JSON.stringify(data) }
               , function(error, response, body){
                //console.log(body); 
    });  
}
/**
 * 
 * @param {any} data
 * @param {any} res
 * @param {any} app
 */
function addMessage(data,res,app){
    //Make sure data is the body of the request. 
    data = data.body; 

    switch (data.type) {

    }

    if (typeof data.result == 'undefined') {
        var ins = db.prepare(`INSERT INTO chats(date,chatid,avatar,content,by) VALUES (CURRENT_TIMESTAMP,"${data.id}","${data.avatar}","${escape(data.content)}","${data.by}")`);
        ins.run(function () {
            this.lastID;
            db.get(`SELECT * FROM chats WHERE rowid=${this.lastID}`, function (err,row) {
                app.io.emit("update", row,); 
            });
        });
        ins.finalize();

        db.each('SELECT rowid AS id, * FROM chats ORDER BY id DESC LIMIT 1;', function (err, row) {
            console.log(`Added message "${row.content}", from ${row.by}`)
        });

        
    }

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

function getData(res) {
    var htmlData = ''; 
    console.log("Pulling the last 100 messages from chat!"); 
    return new Promise((resolve, reject) => {
        db.all("SELECT * FROM chats ORDER BY rowid DESC", [], (err, rows) => {
            rows.forEach((row) => {
                //console.log(row.content); 
                if (row.content != null) {
                    row.content = unescape(row.content);
                    res.render('chat', row, function (err, html) {
                        //console.log(row);
                        htmlData += html;
                    });
                }
                else {
                    res.render('roll', row, function (err, html) {
                        html = html.replace(/(^,)|(,$)/g, "")
                        htmlData += html;
                    });
                }
            });
            resolve(htmlData); 
        });
    });   
}

async function prepBox(err, html, res){
    let d = await getData(res); 
    //console.log(d); 
    res.render('chatBox', {data:d}); 
};




module.exports = {
    sendMessage: sendMessage,
    addMessage: addMessage,
    prepBox: prepBox
}