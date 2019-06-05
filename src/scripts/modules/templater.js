class templater{
	constructor($,name,options = {}){
		//Initial sanity checks
		if(Object.keys(options).length == 0){return false}
		
		//Vars
		this.keys = Object.keys(options);
		this.values = Object.values(options); 
		this.options = options; 
		this.template = {};
		this.name = name; 
		this.$ = $; 
		
	}
	
	async parse(){
		if(Object.keys(this.template).length == 0){
			const jb_templates = chrome.extension.getURL(`templates/${this.name}.template`);
			
			try{
				let template = await this.$.ajax({
					url: jb_templates, 
				});
				
				this.template = this.$(template); 
			}
			catch(e){
				console.warn(`TEMPLATER: Couldn't load template ${this.name}.template!`);
				console.log(jb_templates); 
				console.log(e); 
				return false;
			}
			
		}
		let tempText = this.template.html();
		
		for(let k of this.keys){
			try{
				tempText = tempText.replace(`{{${k}}}`,this.options[k]);
			}
			catch{
				console.warn(`TEMPLATER: Couldn't find value for ${k}!`);
			}
		}
		
		
		return tempText; 
	}
	
}

let t = templater;
export default t; 


