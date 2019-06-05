class notes{
	constructor($,name,target = '.instructions'){
		this.$ = $;
		this.templater; 
		this.target = target; 
		
	}
	
	async add(id,options){
		if(this.templater == undefined){
			
			let templater = await import(chrome.extension.getURL("scripts/modules/templater.js"));
			templater = templater.default;
			templater = new templater(this.$,'note',options);
			this.templater = templater; 
		}
		
		let noteText = await this.templater.parse();
		this.$(this.target).html(noteText); 
		
	}
	
}

let t = notes;
export default t; 


