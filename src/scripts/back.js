//EXTERNAL
chrome.runtime.onMessageExternal.addListener(
    function (message, sender, sendResponse) {
        alert("in background");
        chrome.runtime.sendMessage({ id: 'getMessage' }, function (r) {
            console.log(r); 
        });

        //sendResponse({ s: true, r: 'test' });
    }
);


//INTERNAL
chrome.runtime.onMessage.addListener(
    function (request, sender, sendResponse) {
        if (request.type == "ROBS") {

            $.ajax({
                url: `http://localhost:9000/`,
                type: "POST",
                data: request,
                success: function (r) {
                    console.log(r); 
                }
            });
            
        }
        
    });


// this is the background code...

// listen for our browerAction to be clicked
chrome.browserAction.onClicked.addListener(function (tab) {
    alert('done'); 
    // for the current tab, inject the "inject.js" file & execute it
    chrome.tabs.executeScript(tab.ib, {
        file: 'inject.js'
    });
});

var urls = ["https://app.roll20.net/assets/base.js",
    "https://app.roll20.net/assets/app.js"];

var host = "https://app.roll20.net/editor/";

chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        let u = chrome.extension.getURL('/');

        if (details.url.indexOf("base.js") != -1) {
            alert('intercept'); 
            return { redirectUrl: "https://app.roll20.net/assets/base.js" };
        }

     

    }, {
        urls: ["https://app.roll20.net/assets/base.js*"] },
    ["blocking"]
);