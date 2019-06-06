class jukebox{
	constructor($){
		this.notes = {};
		this.$ = $;
		//The section in question can contain one of two elements depending on the player state.  
		this.songBox = this.$(`.playingitem`).length != 0 ? this.$(`.playingitem`) : this.$(`.whatsplayingtitle`); 
		this.songText = this.$(this.songBox).html(); 
		
	}

	
	async start(){
		let jq = await import(chrome.extension.getURL("scripts/lib/jquery.min.js"));
		let note = await import(chrome.extension.getURL("scripts/modules/notes.js"));
		console.log(jq.jQuery); 
		return;
		note = note.default; 
		note = new note(); 

		
		
		
		
		//If the standard message is there OR it's undefined
		if(this.songText == undefined || this.songText.indexOf('Nothing, currently.') != -1){
			note.add('noSong',{TITLE:"No song is playing!",INFO:"Select a song/playlist to start sending the information to OBS."}); 
			var self = this; 
			this.$('#jukeboxfolderroot').find('.play').click(function(){
				let t = setTimeout(function(){
					this.process();
				}.bind(self),400);
				
				
			});
			
		}
		else{
			//this.process();
		}
	}
	
	process(){ 
			this.songBox = this.$(`.jukeboxitem `);
		
			this.$('#jukeboxfolderroot').find('.play').click(function(){
				alert('click');
				this.process();
			}.bind(this));
		//this.songBox.css('border','5px solid red !important'); 
	}
}

let j = jukebox;
export default j; 