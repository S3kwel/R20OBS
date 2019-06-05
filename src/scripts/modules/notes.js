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
			this.id = id; 
		}
		
		//Parse the template
		let noteText = await this.templater.parse();
		
		//Set the ID.  
		alert(this.id); 
		noteText = $(noteText).attr('id',this.id); 
		
		//Append the element. 
		this.$(this.target).replaceWith(noteText); 
		
		this.$(`#${this.id}`).click(this.remove); 
	}
	remove(){
		$(`#${this.id}`).remove(500); 
	}
	
}

let t = notes;
export default t; 


