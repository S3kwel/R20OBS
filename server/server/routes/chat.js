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
                   console.log(body); 
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

    console.log(data); 

    //All queries should have this information at least.
    let cols = ['date', 'avatar', 'messageid', 'timestamp', 'by'];

    console.log("incoming", data.type, "...."); 

    switch (data.type) {
        case "roll":
            cols.push('type','formula', 'result', 'crit', 'fail'); 
            break;
        case "text":
        case "emote": 
            cols.push('type','content');
            break;
        case "attack":
            cols.push('type','result', 'formula', 'sublabel', 'label', 'advantage', 'description');
            break;
        case "damage":
            cols.push('type','result', 'formula', 'sublabel','label');
            break;
        case "spell":
            cols.push('name', 'type','castingtime', 'range', 'target', 'components', 'duration', 'description'); 
            break; 
        case "trait":
            cols.push('type', 'name', 'components', 'description')
            break;
        case "skill":
            cols.push("type", "result", "formula", "name");
            break;
        case "spellattack":
            cols.push("type","advantage","castingtime","description","duration","formula","label","range","result","sublabel","target","components");
            break; 
    }

    //BUILD THE QUERY
    let v;
    let query = `INSERT INTO chat(`;
    for (let c of cols) {
        //Date is the one column that breaks the genreal rule. 
        query += `${c},`       
    }

    query = query.substring(0, query.length - 1); 
    query += ') VALUES(';

    for (let c of cols) {
        if (c == "date") {
            v = new Date();
        }
        else if (c == 'description' || c == 'content') {
            v = escape(data[c]); 
        }

        else {
            v = data[c];
        }
        query += `"${v}",`;
    }

    query = query.substring(0, query.length - 1); 
    query += `)`; 

    //Prepare/run the query.  'Update' chat with the new data.  
    var ins = db.prepare(query);
    ins.run(function () {
        db.get(`SELECT * FROM chat WHERE rowid=${this.lastID}`, function (err, row) {
            app.io.emit("update", row);
        });
    });

    ins.finalize();

    db.each('SELECT rowid AS id, * FROM chat ORDER BY id DESC LIMIT 1;', function (err, row) {
        console.log(`Added ${row.type}, from ${row.by}`)
    });

    //RESET COLS
    cols = ['date', 'avatar', 'messageid', 'timestamp', 'by'];
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
        db.all("SELECT * FROM chat  ORDER BY rowid DESC LIMIT 5", [], (err, rows) => {
            rows.forEach((row) => {
                if (row.type != null) {
                    res.render(row.type, row, function (err, html) {
                        if (typeof html != 'undefined') {
                            //console.log(row);
                            //console.log("ADDED ", html);
                            htmlData += html;
                        }
                        else {
                            console.log(`Skipping ${row.type} due to a lack of a template!`);
                        }

                    });
                }
                else {
                    console.log(`Skipping a null row!`);
                    console.log(row); 
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