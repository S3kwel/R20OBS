$(async function(){
	const jb_src = chrome.extension.getURL("scripts/modules/jukebox.js");

	
	let jukebox = await import(jb_src);
	jukebox = jukebox.default;

	let JB = new jukebox($); 
	JB.start(); 
	
	
	
	

	
	
	
})