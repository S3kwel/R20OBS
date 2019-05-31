$(async function(){
	function log(message){
		console.log(`%c ${message}`,`background: #222; color: #bada55`);
	}
	
	let firstMutation = true; 
	
	let chatBox = $(`.content`); 
	let jB = $('#jukeboxwhatsplaying');
	//let nP = jb.find('.nowplayingtitle');
	
	
	jB.css('border','1px solid red'); 
	//nP.css('border','2px solid green');  
	
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
	
	
	var checkMusic = function(mutationList, observer){
		if(m.type == 'childList' && firstMutation == false){
				let message = m.addedNodes[0];
				log("MUSIC"); 
				console.log(message);
			}
	}
	
	var messages = new MutationObserver(process);
	var music = new MutationObserver(checkMusic);
	
	messages.observe(chatBox[0], config);
	music.observe(jB[0], config);
	
	//$(text).css('border','3px solid blue'); 
})