var doctorList = [];
var npiList = [];

$('.doctorList').on('click', '.sbx-custom__reset2', function() {
    const indexToRemove = $(this).parent().parent().index();
    npiList.splice(indexToRemove, 1);
    doctorList.splice(indexToRemove, 1);
    $(this).parent().remove();
    renderCharts();
});

	
	$('#autocomplete').autocomplete({
    	serviceUrl: '/data',
    	onSelect: function (suggestion) {
    		$('#autocomplete').val('');
    		
    		doctorList.push(suggestion);
    		npiList.push(suggestion.npi);

    		var inHTML = ""
    		$.each(doctorList, function(index, value){
                var newItem =  $('.doctorWrapper');
                $('.doctor .doctorName').text(doctorList[index].label);
                $('.doctor #npi').text("npi: " + doctorList[index].npi);
                $('.doctor #city').text("location: " + doctorList[index].city + ', ' + doctorList[index].state);
                $('.doctor #taxonomy').text("taxonomy: " + doctorList[index].taxonomy);
               
    			inHTML += newItem.html(); 
			});

			$(".doctorList .col").html(inHTML);
			
            renderCharts();
			
    	},
 
	});

function renderCharts() {
	var npis = npiList.toString();
	$('#chart1').attr('src', 'http://docharts.niksingh.net/?npi=' + npis);
	$('#chart2').attr('src', 'http://docharts.niksingh.net/?npi=' + npis + '&type=2');
	// $('#chart3').attr('src', 'http://docharts.niksingh.net/?npi=' + npis);
}
