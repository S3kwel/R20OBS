chrome.runtime.onMessageExternal.addListener(
    function (message, sender, sendResponse) {
        alert("in background");
        sendResponse("1");
    }
);