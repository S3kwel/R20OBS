class jukebox{
	constructor($){
		this.notes = {};
		this.$ = $;
		//The section in question can contain one of two elements depending on the player state.  
		this.songBox = $(`.playingitem`).length != 0 ? $(`.playingitem`) : $(`.nowplayingtitle`); 
		this.songText = $(this.songBox).html(); 
		
	}
	
	async start(){
		let note = await import(chrome.extension.getURL("scripts/modules/notes.js"));
		note = note.default; 
		note = new note(this.$); 

		//If the standard message is there OR it's undefined
		if(this.songText == undefined || this.songText.indexOf('Nothing, currently.') != -1){
			note.add('noSong',{TITLE:"No song is playing!",INFO:"Select a song/playlist to send the information to OBS."}); 
		}
		else{
			//this.addNote(templates['reload']); 
		}
		
		
		
		
	}
}

let j = jukebox;
export default j; 