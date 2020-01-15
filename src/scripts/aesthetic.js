toggle = "in"
lastDir = "in"; 
$(function () {

    let type = "setmode";
    let title = "Streaming Mode"; 
    let url = chrome.extension.getURL("/"); 

    var handleTemplate = `
    <span class='test'>
    <div class="customHandle showtip handleDisable setmode ${type}" style="bottom: -30px; right: 360px;" original-title="${title}">
        <span class="pictos">E</span>
    </div></span>`;

   

       
   

    //Handler for "Extension Visuals" button
    $('#sidebarcontrol').click(function (event) {
    

        newRight = $('.handle.showtip').not('.setmode').css('right');
        newRight = parseInt(newRight.substring(0, newRight.indexOf('px'))) + 35;
        $('.setmode').css('right', newRight + "px");
    });

    $('body').on('click','.setmode',function () {
        //Toggle the CSS class for the X over the icon.
        $(this).toggleClass('handleDisable'); 

        $("#sidebarcontrol").click(); 

        //Check for the streaming stylesheet.  Add it, if needed.  
        let sheet = $('#streamsheet');
        if (sheet.length == 0) {
            $('head').append(`<link ID = "streamsheet" rel='stylesheet' type="text/css" href="${url}styles/stream.css">`);
        }
        else {
            $('#streamsheet').remove();
            if (sidebarRight == "0px") {
                $('#sidebarcontrol').click();
            }
        }

       
        //Click the button to toggle the chat
        let sidebarRight = $("#sidebarcontrol").css('right'); 
        if (sidebarRight != "0px") {
            $('#sidebarcontrol').click(); 
        }

       
       
       


       
    }); 
   $('#page-toolbar').append(handleTemplate); 
   //#finalcanvas has the ping event.


    $('#textchat-input').find('textarea').val(`!robspageinfo`);
    $('#textchat-input').find('button').click();

    $('#finalcanvas').mousemove(function (e) {

        let editor = $("#editor-wrapper")[0];
        editor.scrollTop += e.pageY; 
        editor.scrollLeft += e.pageX; 

        //$('#textchat-input').find('textarea').val(`!robsping {x:${e.pageX},y:${e.pageY}}`);
        //$('#textchat-input').find('button').click();

        console.log(`!robsping {x:${e.pageX},y:${e.pageY}}`); 
        //console.log($('#tmpl_pagesettings').text()); 
    });
   

});