toggle = "in"
lastDir = "in"; 
$(function () {
    var numScriptsDone = 0;
    let type = "setmode";
    let title = "Streaming Mode"; 
    let url = chrome.extension.getURL("/"); 
    var hookedScriptQueue = [];
    const getHooks = (hooks, url) => {

        let hookQueue = [];
       


        for (let id in hooks) {
            let hook = hooks[id];

            hookQueue.push({ mod, hook });
        }

        return hookQueue;
    };

    const injectHooks = (intoWhat, hookQueue, replaceFunc) => {
        if (hookQueue.length <= 0) return intoWhat;

        for (let combo of hookQueue) {
            const mod = combo.mod;

            // TODO : move this to Configs.js?
            const patch = replaceFunc(mod.patch, ">>R20ES_MOD_FIND>>", mod.find);

            console.log(`REPLACING: Find: ${mod.find} Patch: ${patch}`);
            intoWhat = replaceFunc(intoWhat, mod.find, patch);
        }

        return intoWhat;
    };

    const injectScript = function (u) {
        let d = document; 
        e = document.createElement('script');
        var m = document.getElementsByTagName('head')[0];
        e.src = chrome.extension.getURL(u);
        m.appendChild(e);

    }

    const waitForDepts = () => {
        if (document.readyState !== "complete") {
            setTimeout(waitForDepts, 10);
            return;
        }

        console.log("DOM LOADED, requesting redirectQueue.");

        chrome.runtime.sendMessage({
            ['r20es_domLoaded']: true,
        }, (redirectQueue) => {
            console.log("Received redirectQueue from background:", redirectQueue);

            for (let urlIndex = 0;
                urlIndex < redirectQueue.length;
                urlIndex++) {
                const url = redirectQueue[urlIndex];
                const response = fetch(url);

                response.then(response => {

                    const textPromise = response.text();

                    textPromise.then(originalScriptSource => {
                        {
                            let hookedData = originalScriptSource;
                            // take over jquery .ready
                            hookedData = hookedData.replace(
                                "jQuery.ready.promise().done( fn );",
                                `if(!window.r20esChrome) window.r20esChrome = {};
                                 if(!window.r20esChrome.readyCallbacks) window.r20esChrome.readyCallbacks = [];
                                window.r20esChrome.readyCallbacks.push(fn);`);

                            // incredibly long loading screens fix
                            hookedData = hookedData.replace(
                                `},6e4))`,
                                `},250))`);

                            //<!DOCTYPE html>
                            hookedData = hookedData.replace(`<!DOCTYPE html>`, ``); 

                            //const hookQueue = getHooks(hooks, url);
                           
                            const blob = new Blob([hookedData]);
                            const hookedScriptUrl = URL.createObjectURL(blob);
                            const scriptElement = document.createElement("script");

                            scriptElement.async = false;
                            scriptElement.src = hookedScriptUrl;
                            scriptElement.id = url;

                            hookedScriptQueue[urlIndex] = scriptElement;
                        }

                        numScriptsDone++;


                        if (numScriptsDone === redirectQueue.length) {

                            /*
                                NOTE(justas);
                                for some reason, when we call document.body.appendChild(scriptElement);
                                the screen flashes white because the styles get all messed up.
                                This style change bodges a workaround by making the background black,
                                thus the flash becomes subtle.
                                @BootstrapFlashWorkaroundStyle
                             */
                           // {
                           //     const style = document.createElement("style");
                           //     style.innerHTML = "body { background: black !important; }";
                           //     style.id = ELEMENT_ID_BOOTSTRAP_FLASH_WORKAROUND_STYLE;
                           //     document.head.appendChild(style);
                           // }

                            console.log("Scripts are done, dumping", hookedScriptQueue);

                            for (const indexKey in hookedScriptQueue) {
                                const scriptElement = hookedScriptQueue[indexKey];

                                try {
                                    console.log("Injecting ", scriptElement);
                                    document.body.appendChild(scriptElement);
                                }
                                catch{

                                }
                            }

                            injectScript("inject.js");
                        }
                    });

                    textPromise.catch(e => {
                        console.error("FATAL: textPromise of redirectQueue fetch failed: ", url, e);
                    })
                });

                response.catch(e => {
                    console.error("FATAL: fetch redirectQueue promise failed: ", url, e);
                })
            }
        });
    };

    waitForDepts();



    var handleTemplate = `
    <div class="customHandle showtip handleDisable setmode ${type}" style="bottom: -30px; right: 360px;" original-title="${title}">
        <span class="pictos">E</span>
    </div>`;

    

    var bgTemplate = `
    <video autoplay muted loop id="R20OBSBG">
        <source src="${url}images/magic.mp4" type="video/mp4">
    </video>`; 

    $('#page-toolbar').append(handleTemplate);
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


    $('body').on('keyup', function (e) {
        if (e.key == "F11") {
            enterStreamingMode(); 
        }
    });

  
 
    $('#finalcanvas').mousemove(function (e) {

        let editor = $("#editor-wrapper")[0];


        //$('#textchat-input').find('textarea').val(`!robsping {x:${e.pageX},y:${e.pageY}}`);
        //$('#textchat-input').find('button').click();

       // console.log(`!robsping {x:${e.pageX},y:${e.pageY}}`); 
        //console.log($('#tmpl_pagesettings').text()); 
    });
   

});