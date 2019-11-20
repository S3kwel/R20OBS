"use strict"
$(function () {
    //Hide the chat
	$('#sidebarcontrol').click(); 
	
	
	
	//Set Zoom Level...
	
	$('#zoomslider').slider({orientation:"vertical",min:10,max:250,value:100});
	//let slider = $('#zoomslider'); 

	//d20.engine.slideZoom(n, !0);
	$('#zoomslider').slider('value',200);  
	//$('#zoomslider').slider('slide');
	//$('#zoomslider').trigger('change');
	

	

		//Only works in popup mode.  
		window.resizeTo(1280, 720);
	
	
		$('#zoomslider').find('a').click();

                                     
		//slider.remove(); 
	
	$('.ui-slider-handle.ui-state-default.ui-corner-all').click(); 
});