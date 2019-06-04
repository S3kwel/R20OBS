class jukebox{
	constructor($){
		$(function(){
		let templates = {};
		templates['reload'] = 
		`<div class = 'robs info'>
			<div class = 'info header'>
			    <span class='dismiss'>X</span>
				No song is playing!
			</div>
			<div class='info body'>
				Connection to the websocket will begin as soon as something is played.
			</div>
		</div>`;
		
		//Remove all existing elements. 
		$(`.robs`).remove();
		
		
		
	
		//The section in question can contain one of two elements depending on the player state.  
		this.songBox = $(`.playingitem`).length != 0 ? $(`.playingitem`) : $(`.nowplayingtitle`); 
		this.songText = $(this.songBox).html(); 
		
		//If the standard message is there OR it's undefined

		if(this.songText == undefined || this.songText.indexOf('Nothing, currently.') != -1){
			
			$(`.instructions`).html(templates['reload']); 
		}
		else{
			$(`#containerdiv`).children().first().prepend('aaa')
		}
		
	
			
		})
	}
}

let j = jukebox;
export default j; 