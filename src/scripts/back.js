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
                url: `http://localhost:1337/`,
                type: "POST",
                data: request,
                success: function (r) {
                    console.log(r); 
                }
            });
            
        }
        
    });
