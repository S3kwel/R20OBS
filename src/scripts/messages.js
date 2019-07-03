$(async function () {



	function log(message){
		console.log(`%c ${message}`,`background: #222; color: #bada55`);
    }
	
	let firstMutation = true; 
	
	let chatBox = $(`.content`); 
	let jB = $('#jukeboxwhatsplaying'); 
	
	let config = {attributes: false, childList: true, subtree: false};

	
	var process = function(mutationList, observer){
	
		
		for(m of mutationList){
            if (m.type == 'childList' && firstMutation == false) {

                //Listen to calls from the background to send messages to external?
               

                let message = m.addedNodes[0];
               
                if (message != undefined) {
                    console.log("ADDED MESSAGE NODE IS ", message);
                    var classArray = [...message.classList];

                    if (classArray.indexOf('system') == -1) {
                        //Extract data from the return


                        //messageid
                        let id = $(message).data('messageid');
                        let rightMessage = false;
                        let msg = $(message);

                        let childLen = msg.children().length;
                            //console.log("INITIAL CHILDLEN IS", childLen);
                         

                        do {
                            if (childLen != 0) {
                                let by = $(msg).children('.by').html();
                                console.log(by);
                                console.log("FOUND RIGHT MESSAGE: ", msg);
                                rightMessage = true;
                            }
                            else {
                                msg = $(msg).prev('.message');
                                childLen = msg.children().length;
                                //console.log('NEXT MESSAGE IS', msg);
                                //console.log('ITS CHILDLEN IS', childLen);
                            }
                        }
                        while (rightMessage == false);
                      
                        let avatar = `https://app.roll20.net` + $(msg).children().find('img').eq(0).attr('src');
                        let timeStamp = $(message).children('.tstamp').html();
                        by = $(msg).children('.by').html();
                        let content = $(message).html();

                        //Pulls data after the name if present.
                        //TODO: This won't work if the user's message has : in it. 
                        if (content.match(/:/gmi) != null) {
                            content = content.substring(content.lastIndexOf(':') + 8);
                        }
                       
                        var r = {'type':'ROBS','id': id, 'avatar': avatar, 'timestamp': timeStamp, 'by': by, 'content': content };

                        //Send message to background. 
                        chrome.runtime.sendMessage(r);
                        console.log(r); 
                        r = {}; 

                        chrome.runtime.sendMessage(r);
                        console.log(r); 
                    }
                    
				}
			}
		}
		
		//Prevents the first mutation -- the loading of old messages -- from triggering anything.  
		if(firstMutation == true){
			firstMutation = false;
				log("Scrubbing Jukebox."); 
				jukeBoxScrub(); 
			}
	}
	
	
	async function jukeBoxScrub(){
		const jb_src = chrome.extension.getURL("scripts/modules/jukebox.js");
		
		let jukebox = await import(jb_src);
		jukebox = jukebox.default;

		let JB = new jukebox($); 
		JB.start(); 
	}
	
	var messages = new MutationObserver(process);
	
	messages.observe(chatBox[0], config);
	
	//$(text).css('border','3px solid blue'); 
})