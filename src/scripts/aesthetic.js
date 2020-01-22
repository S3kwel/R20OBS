let type = "setmode";
let title = "Streaming Mode"; 
let url = $('script.R20OBS_SCRIPT').eq(0).data('extension'); 



var streamingMode = `
<div class="customHandle showtip handleDisable setmode" style="bottom: -30px; right: 393px;" original-title="Streaming Mode">
    <span class="pictos">E</span>
</div>`;

    

    var bgTemplate = `
    <video autoplay muted loop id="R20OBSBG">
        <source src="${url}images/magic.mp4" type="video/mp4">
    </video>`; 

    $('#page-toolbar').append(streamingMode);
    $('.tabmenu').find('.setmode').addClass('tabmenu'); 

   

    function enterStreamingMode() {
        

        var sideBarState = ($("#rightsidebar").css('display') == 'none') ? false : true;
        let sheet = $('#streamsheet');

        //Toggle the CSS state for the button.
        $('.setmode').toggleClass('handleDisable');
        //If true, click to hide.  
        if (sideBarState) {
            $("#sidebarcontrol").click();
        }

        //Check for the streaming stylesheet.  Add it, if needed.  
        if (sheet.length == 0) {
            $('head').append(`<link ID = "streamsheet" rel='stylesheet' type="text/css" href="${url}styles/stream.css">`);
            $(bgTemplate).insertAfter("#editor-wrapper")
            return;
        }

        //Otherwise, remove it.
        $('#streamsheet').remove();
        $("#R20OBSBG").remove();
        sidebarRight = $("#sidebarcontrol").css('right');

        //If false, click to show. 
        if (!sideBarState) {
            $('#sidebarcontrol').click();
        }
    }


    //Handler for "Extension Visuals" button
    $('#sidebarcontrol').click(function (event) {
        newRight = $('.handle.showtip').not('.setmode').css('right');
        newRight = parseInt(newRight.substring(0, newRight.indexOf('px'))) + 35;
        $('.setmode').css('right', newRight + "px");
    });

    //Toggle streaming mode w/ the added icon.  
    $('body').on('click', '.setmode',enterStreamingMode); 


