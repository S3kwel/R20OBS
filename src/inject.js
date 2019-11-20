
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
				//let v = $._data( $(document)[0], "events" );'
				//TO GET EVENTS BOUND TO DOCUMENT
			},speed);	
		});
		
		
        var s = $("#editor-wrapper");
        s.on("scroll", function() {
            var e = Math.round(s.scrollTop() / d20.engine.canvasZoom)
              , t = Math.round(s.scrollLeft() / d20.engine.canvasZoom);
            t < d20.engine.padding ? (d20.engine.paddingOffset[0] = d20.engine.padding - t,
            d20.engine.currentCanvasOffset[0] = 0) : d20.engine.pageWidth / d20.engine.canvasZoom - t - d20.engine.canvasWidth / d20.engine.canvasZoom + d20.engine.padding < 0 ? (d20.engine.paddingOffset[0] = d20.engine.pageWidth / d20.engine.canvasZoom - t - d20.engine.canvasWidth / d20.engine.canvasZoom + d20.engine.padding,
            d20.engine.currentCanvasOffset[0] = t - d20.engine.padding + d20.engine.paddingOffset[0]) : (d20.engine.paddingOffset[0] = 0,
            d20.engine.currentCanvasOffset[0] = t - d20.engine.padding),
            e < d20.engine.padding ? (d20.engine.paddingOffset[1] = d20.engine.padding - e,
            d20.engine.currentCanvasOffset[1] = 0) : d20.engine.pageHeight / d20.engine.canvasZoom - e - d20.engine.canvasHeight / d20.engine.canvasZoom + d20.engine.padding < 0 ? (d20.engine.paddingOffset[1] = d20.engine.pageHeight / d20.engine.canvasZoom - e - d20.engine.canvasHeight / d20.engine.canvasZoom + d20.engine.padding,
            d20.engine.currentCanvasOffset[1] = e - d20.engine.padding + d20.engine.paddingOffset[1]) : (d20.engine.paddingOffset[1] = 0,
            d20.engine.currentCanvasOffset[1] = e - d20.engine.padding);
            var n = d20.engine.pageWidth + 2 * d20.engine.padding < d20.engine.canvasWidth ? d20.engine.pageWidth : d20.engine.canvasWidth - d20.engine.paddingOffset[0]
              , i = d20.engine.pageHeight + 2 * d20.engine.padding < d20.engine.canvasHeight ? d20.engine.pageHeight : d20.engine.canvasHeight - d20.engine.paddingOffset[1];
            a.width() == n && a.height() == i || a.css({
                width: n + "px",
                height: i + "px"
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
	
	for(let d of datas){
		let dataKeys = Object.keys(d); 
		
		for(dK of d
	}
	//"mousewheel"
	
	
});