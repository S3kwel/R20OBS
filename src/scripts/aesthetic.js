"use strict"
$(function () {
    //Hide the chat
	$('#sidebarcontrol').click(); 
	
	
	
	//Set Zoom Level...
	var slider = $('#zoomslider').find('a').eq(0);
		console.log(slider); 
		
		//Only works in popup mode.  
		window.resizeTo(1280, 720);
	
		setInterval(function(){
		slider.slider('value',50);
		
		
		},500);
		$('#zoomslider').find('a').click();

                                     
		//slider.remove(); 
	
	$('.ui-slider-handle.ui-state-default.ui-corner-all').click(); 
});