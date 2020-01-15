on("chat:message", function (msg) {
    //This allows players to enter !sr <number> to roll a number of d6 dice with a target of 4.
    if (msg.type == "api" && msg.content.indexOf("!robsping") !== -1) {
        //Commands should bei n the format {x:...,y:...}
        var string = msg.content.replace("!robsping", "");
        string = string.replace(" ", "");
        string = JSON.stringify(string);
        log(string);
        var coords = JSON.parse(string);
        if (typeof coords.x != undefined && typeof coords.y != undefined) {
            log(coords);
            var playerpageid = Campaign().get('playerpageid');
            sendPing(coords.x, coords.y, playerpageid, null, true);
        }
        return; 
        

       // center everyone on the selected token


        //sendChat(msg.who, "/roll " + numdice + "d6>4");
    }
});