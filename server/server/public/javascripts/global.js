$(function () {
    //Shorten names longer than 30 characters...
    let names = $('.name');
    for (let n of names) {
        let text = $(n).text();
        if (text.length > 30) {
            $(n).text(text.substring(0, 30) + "...");
        }
    }

    //Contents more than 400 characters...
    let contents = $('.content');
    console.log(contents);
    for (let c of contents) {
        let content = $(c).text(); 

        if (content.length > 400) {
            $(c).text(content.substring(0, 400) + '...'); 
        }
    }

    //Connect to the server
    var socket = io.connect('http://localhost:9001');
    socket.on("update", function (data) {
        socket.emit("parse", data);
    });

    //Hide the mmessages after a short time.
    $('.container').delay(5000).hide("slide", { direction: "right" }, 300); 

    socket.on("parsed", function (data) {
        console.log(data);
        data = $(data).css('display', 'none');
        $('body').prepend(data);
        $('.container').first().fadeIn(1000).delay(15000).hide("slide", { direction: "right" }, 300);
    });

});