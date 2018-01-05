$( document ).ready(function() {
  	resize();
	
	$( window ).resize(function() {
		resize();
	});

	function resize(){
		const width = $('.doctorList').width() - 65;
		$('.doctorName').css('width', width);
	}
});


