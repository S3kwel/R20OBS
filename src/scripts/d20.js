$(function () {
    let numScriptsDone = 0; 
    var hookedScriptQueue = []; 

    const injectScript = function (u) {
        let d = document;
        e = document.createElement('script');
        var m = document.getElementsByTagName('head')[0];
        e.src = chrome.extension.getURL(u);
        e.dataset["extension"] = chrome.extension.getURL("/"); 
        e.classList.add("R20OBS_SCRIPT");  
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


                            //D20 Expose!
                            hookedData = hookedData.replace('getPointer,degreesToRadians;', 'getPointer,degreesToRadians;window.d20=d20;');

                         
                            //alert(hookedData.indexOf("DRAWPINGS")); 

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

                            injectScript("/scripts/d20startup.js");
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

    window.onmessage = function (event) {
        if (event.data == "ready") {
            injectScript("scripts/aesthetic.js"); 
        }
    };


});