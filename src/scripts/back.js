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

 const MESSAGE_KEY_DOM_LOADED = "r20es_domLoaded";

const editorUrls = [
    "https://app.roll20.net/editor",
    "https://app.roll20.net/editor/",
    "https://app.roll20.net/editor/#*", // handle all fragments
    "https://app.roll20.net/editor#*",
    "https://app.roll20.net/editor/?*", // handle all queries
    "https://app.roll20.net/editor?*"
];

const targetScripts = [
    "https://app.roll20.net/v2/js/jquery",
    "https://app.roll20.net/js/featuredetect.js",
    "https://app.roll20.net/editor/startjs",
    "https://app.roll20.net/js/jquery",
    "https://app.roll20.net/js/d20/loading.js",
    "https://app.roll20.net/assets/firebase",
    "https://app.roll20.net/assets/base.js",
    "https://app.roll20.net/assets/app.js",
    "https://app.roll20.net/js/tutorial_tips.js",
];

let alreadyRedirected = {};
let redirectQueue = [];
let isRedirecting = false;

const isEditorRequest = (request) => {
    const url = request.url;

    if (url.startsWith("https://app.roll20.net/editor/setcampaign/")) {
        return true;
    }

    if (url === "https://app.roll20.net/editor/") {
        return true;
    }

    if (url === "https://app.roll20.net/editor") {
        return true;
    }

    if (url.startsWith("https://app.roll20.net/editor?")) {
        return true;
    }

    if (url.startsWith("https://app.roll20.net/editor#")) {
        return true;
    }

    return false;
};


const beginRedirectQueue = () => {
    if (isRedirecting) {
        return;
    }

    isRedirecting = true;
    alreadyRedirected = {};
    redirectQueue = [];

    //console.log("Beginning redirect queue.");
};

const endRedirectQueue = () => {
    //console.log("Ending redirect queue.");
    isRedirecting = false;
};

//Blocks the request and adds it to the redirect queue.  
window.requestListener = function (request) {
    if (isEditorRequest(request)) {
        console.log("Editor, blocking:", request.url, request);
        beginRedirectQueue();
    }
    else if (request.type === "script") {
        for (const url of targetScripts) {

            if (request.url.startsWith(url)) {
                beginRedirectQueue();

                if (alreadyRedirected[request.url]) {
                    //console.log(`not queueing request due to alreadyRedirected: ${request.url}`, request);
                }
                else {
                    //console.log(`queueing ${request.url}`);
                    redirectQueue.push(request.url);
                    alreadyRedirected[request.url] = true;

                    return {
                        cancel: true
                    }
                }

                break;
            }
        }
    }
}

//Send the redirect queue to the content script.  
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg[MESSAGE_KEY_DOM_LOADED]) {
        endRedirectQueue();

        console.log("Received MESSAGE_KEY_DOM_LOADED from content script, responding with redirectQueue:", redirectQueue);
        sendResponse(redirectQueue);
    }
});

/*
 * Sets the CSP header of req to a BLOB'ed version of itself.  
 * */
const headerCallback = (req) => {

    if (!isEditorRequest(req)) {
        return;
    }

    //console.log("Editor, headers:", req.url, req);
    beginRedirectQueue();

    //console.log(`HEADER CALLBACK (processing headers) for ${req.url}`, req);

    const headers = JSON.parse(JSON.stringify(req.responseHeaders));

    let idx = headers.length;
    while (idx-- > 0) {
        const header = headers[idx];

        const name = header.name.toLowerCase();
        if (name !== "content-security-policy") {
            //console.log(`ignoring header ${name}`);
            continue;
        }

        header.value += " blob:";
        console.log("!!MODIFIED HEADERS!!");
        break;
    }

    return { responseHeaders: headers };
};

//Prep listeners for headers, requests.  
chrome.webRequest.onHeadersReceived.addListener(
    headerCallback,
    { urls: editorUrls },
    ["blocking", "responseHeaders"]);

chrome.webRequest.onBeforeRequest.addListener(
    window.requestListener,
    { urls: ["*://app.roll20.net/*"] },
    ["blocking"]);
