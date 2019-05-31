$(async function(){
	function log(message){
		console.log(`%c ${message}`,`background: #222; color: #bada55`);
	}
	
	let firstMutation = true; 
	
	let chatBox = $(`.content`); 
	let jB = $('#jukeboxwhatsplaying'); 
	
	let config = {attributes: false, childList: true, subtree: false};

	
	var process = function(mutationList, observer){
	
		
		for(m of mutationList){
			if(m.type == 'childList' && firstMutation == false){
				let message = m.addedNodes[0];
				var classArray = [...message.classList];
				if(classArray.indexOf('you') != -1){
					log("YOU") 
				}
			}
		}
		
		//Prevents the first mutation -- the loading of old messages -- from triggering anything.  
		if(firstMutation == true){firstMutation = false;}
	}
	
	
	
	
	var messages = new MutationObserver(process);
	
	messages.observe(chatBox[0], config);
	
	//$(text).css('border','3px solid blue'); 
})