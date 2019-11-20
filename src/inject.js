
$(function(){
	//$('#zoomslider').slider({orientation:"vertical",min:10,max:250,value:10});
	
	let slider = $("#zoomslider");
	$("#zoomslider").slider('value',250);
	

	
	async function go() {
		await zoomTo(1,10); 
		await zoomTo(250,10);
		await zoomTo(1,10);	
		await zoomTo(250,10);1		
		
	}; 
	
	var zoomTo = function(to,speed){
		//The slider changes its 'bottom,' style property relative to a range from 0-250.  
		var bottom = $('a.ui-slider-handle').attr('style');
		
		var percent = parseInt(bottom.substring(bottom.indexOf(":")+2,bottom.indexOf("%")));
		var current = Math.floor((parseFloat(percent) / 100.0) * 250); 
		
		return new Promise(function(resolve,reject){
			var i = setInterval(function(){
				if(current == to){
					clearInterval(i);
					setTimeout(function(){
						resolve(true);
					}.bind(resolve),1000)
					
					
				}
				
				var dir = 1;
				if(to < current){
					dir = 0; 
				}
				console.log('-----'); 
				if(dir){
					current++;
					//console.log(`${current}/${to}`);
					$("#zoomslider").data('slider').options.slide(null,{value:current})
				}
				else{
					current--;
					//console.log(`${current}/${to}`);
					$("#zoomslider").data('slider').options.slide(null,{value:current})
				}
			},speed);	
		});
		
		

		
	}
	go();
	
	
		//All page elements...		 
	let a = $("*");
	alert(a.length); 
	var datas = []; 
	
	$("*").each(function(id,e){
		let data = $(e).data(); 
		if(Object.keys(data).length != 0){
			console.log("FOUND DATA");
			datas.push({el: e, d: data}); 
		}
	});
	console.log(datas); 
	//"mousewheel"
	
	
});