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
				if(message != undefined){
                    var classArray = [...message.classList];

                    if (classArray.indexOf('system') == -1) {
                        //Extract datafrom the return
                        

                        //messageid
                        let id = $(message).data('messageid');
                        let avatar = `https://app.roll20.net` + $(message).children().find('img').attr('src');
                        let timeStamp = $(message).children('.tstamp').html();
                        let by = $(message).children('.by').html();
                        let content = $(message).html();
                        content = content.substring(content.lastIndexOf(':')+8);
                        var r = {'type':'ROBS','id': id, 'avatar': avatar, 'timestamp': timeStamp, 'by': by, 'content': content };

                        //Send message to background. 
                        chrome.runtime.sendMessage(r);
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