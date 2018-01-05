var doctorList = [];
var npiList = [];


$('#autocomplete').on('input', function() {
    var input = $('#autocomplete').val();
    var name = input.split(' ');
    
    var fName = name[0];
    var lName = name[1] != null ? name[1] : '';
    
    if(fName.length >= 2) {
		fName += '*';
		lName = lName.length >= 2 ? lName + '*' : ''; 
		
		getData(fName, lName);
	}
});

function getData(fName, lName) {
	// computeAutoComplete();
	var theData = [];
	$.ajax({
    	url: 'https://allorigins.us/get?url=https://npiregistry.cms.hhs.gov/api?first_name=Louis&last_name=Maggio&pretty=true',
    	// url : 'https://cors.io/?https://npiregistry.cms.hhs.gov/api?first_name=' + fName + '&last_name=' + lName + '&pretty=true',
    	dataType: "json",
 
    	async: true, 
    	type: 'GET',
    	success: function (data2) {

    		const data = {"result_count":10, "results":[{"taxonomies": [{"state": "OH", "code": "101Y00000X", "primary": false, "license": "C8224", "desc": "Counselor"}, {"state": "OH", "code": "101YM0800X", "primary": false, "license": "C8224", "desc": "Counselor Mental Health"}], "addresses": [{"city": "HEATH", "address_2": "", "telephone_number": "740-334-1823", "fax_number": "740-587-3657", "state": "OH", "postal_code": "430561402", "address_1": "581 HEBRON RD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "GRANVILLE", "address_2": "", "telephone_number": "740-334-1823", "fax_number": "740-587-3657", "state": "OH", "postal_code": "430230022", "address_1": "PO BOX 22", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1146441600, "identifiers": [], "other_names": [], "number": 1780641977, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "MA, PC", "first_name": "JOLENE", "last_name": "SMAAGE", "middle_name": "RAE", "name": "SMAAGE JOLENE", "gender": "F", "sole_proprietor": "NO", "last_updated": "2007-07-08", "enumeration_date": "2006-05-01"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MN", "code": "111N00000X", "primary": false, "license": "5354", "desc": "Chiropractor"}, {"state": "ND", "code": "111N00000X", "primary": true, "license": "1067", "desc": "Chiropractor"}], "addresses": [{"city": "GRAND FORKS", "address_2": "", "telephone_number": "701-757-1145", "fax_number": "701-757-1556", "state": "ND", "postal_code": "582032275", "address_1": "2860 10TH AVE N STE 200", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "GRAND FORKS", "address_2": "", "telephone_number": "701-757-1145", "fax_number": "701-757-1556", "state": "ND", "postal_code": "582032275", "address_1": "2860 10TH AVE N STE 200", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1363046400, "identifiers": [], "other_names": [], "number": 1265773519, "last_updated_epoch": 1510228373, "basic": {"status": "A", "credential": "D.C.", "first_name": "JENNA", "last_name": "SMABY", "middle_name": "RENEE", "name": "SMABY JENNA", "sole_proprietor": "NO", "gender": "F", "last_updated": "2017-11-09", "name_prefix": "DR.", "enumeration_date": "2013-03-12"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "OH", "code": "207R00000X", "primary": true, "license": "35050899-S", "desc": "Internal Medicine"}], "addresses": [{"city": "CLEVELAND", "address_2": "", "telephone_number": "216-368-2457", "fax_number": "216-368-8548", "state": "OH", "postal_code": "441061712", "address_1": "10900 EUCLID AVE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "SHAKER HEIGHTS", "address_2": "", "telephone_number": "216-751-6207", "state": "OH", "postal_code": "441201838", "address_1": "2854 SEDGEWICK RD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1175558400, "identifiers": [{"code": "05", "issuer": "", "state": "OH", "identifier": "0709531", "desc": "MEDICAID"}], "other_names": [{"credential": "M.D.", "first_name": "KATHY", "last_name": "SMACHLO", "middle_name": "ANNE", "prefix": "DR.", "code": "5", "type": "Other Name"}], "number": 1699896696, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "M.D.", "first_name": "KATHLEENE", "last_name": "SMACHLO", "middle_name": "ANNE", "name": "SMACHLO KATHLEENE", "sole_proprietor": "NO", "gender": "F", "last_updated": "2007-07-08", "name_prefix": "DR.", "enumeration_date": "2007-04-03"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MN", "code": "163W00000X", "primary": false, "license": "R 188589-7", "desc": "Registered Nurse"}, {"state": "MN", "code": "363LG0600X", "primary": false, "license": "CNP 3712", "desc": "Nurse Practitioner Gerontology"}, {"state": "MN", "code": "363LA2200X", "primary": true, "license": "CNP 3712", "desc": "Nurse Practitioner Adult Health"}], "addresses": [{"city": "COON RAPIDS", "address_2": "", "telephone_number": "763-780-8155", "state": "MN", "postal_code": "554335841", "address_1": "9055 SPRINGBROOK DR NW", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "MINNEAPOLIS", "address_2": "", "telephone_number": "612-262-5000", "state": "MN", "postal_code": "554071321", "address_1": "2925 CHICAGO AVENUE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1423785600, "identifiers": [], "other_names": [{"last_name": "PRY", "middle_name": "KATHLEEN", "first_name": "ANGELA", "code": "1", "type": "Former Name"}], "number": 1346631280, "last_updated_epoch": 1425340800, "basic": {"status": "A", "credential": "NP", "first_name": "ANGELA", "last_name": "SMACIARZ", "middle_name": "KATHLEEN", "name": "SMACIARZ ANGELA", "gender": "F", "sole_proprietor": "NO", "last_updated": "2015-03-03", "enumeration_date": "2015-02-13"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MD", "code": "207ND0101X", "primary": false, "license": "D0040409", "desc": "Dermatology MOHS-Micrographic Surgery"}, {"state": "MD", "code": "207NS0135X", "primary": false, "license": "D0040409", "desc": "Dermatology Procedural Dermatology"}, {"state": "MD", "code": "207N00000X", "primary": true, "license": "D0040409", "desc": "Dermatology"}], "addresses": [{"city": "EASTON", "address_2": "SUITE 2, 2ND FLOOR", "telephone_number": "410-822-9890", "fax_number": "410-763-9536", "state": "MD", "postal_code": "216014066", "address_1": "5 CAULK LANE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "EASTON", "address_2": "", "telephone_number": "410-822-9890", "fax_number": "410-763-9536", "state": "MD", "postal_code": "216018945", "address_1": "PO BOX 2350", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1129161600, "identifiers": [{"code": "01", "issuer": "CLIA", "state": "MD", "identifier": "21D0931132", "desc": "Other"}, {"code": "01", "issuer": "MAMSI PLANS", "state": "MD", "identifier": "248038", "desc": "Other"}, {"code": "01", "issuer": "MC RAILROAD", "state": "MD", "identifier": "070010482", "desc": "Other"}, {"code": "01", "issuer": "BLUE SHIELD", "state": "MD", "identifier": "KB59TA", "desc": "Other"}, {"code": "01", "issuer": "BLUE SHIELD", "state": "MD", "identifier": "W0170001", "desc": "Other"}], "other_names": [], "number": 1073501912, "last_updated_epoch": 1445867546, "basic": {"status": "A", "credential": "MD", "first_name": "DAVID", "last_name": "SMACK", "middle_name": "PHILLIPS", "name": "SMACK DAVID", "gender": "M", "sole_proprietor": "YES", "last_updated": "2015-10-26", "enumeration_date": "2005-10-13"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MD", "code": "1041C0700X", "primary": true, "license": "11474", "desc": "Social Worker Clinical"}], "addresses": [{"city": "GLEN BURNIE", "address_2": "", "telephone_number": "410-768-2719", "fax_number": "410-424-2983", "state": "MD", "postal_code": "210615613", "address_1": "1419 MADISON PARK DR", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "BALTIMORE", "address_2": "", "state": "MD", "postal_code": "212393501", "address_1": "5200 LEITH RD APT C", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1174435200, "identifiers": [], "other_names": [], "number": 1538285655, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "LCSW-C", "first_name": "STEPHANIE", "last_name": "SMACK", "middle_name": "D", "name": "SMACK STEPHANIE", "sole_proprietor": "YES", "gender": "F", "last_updated": "2007-07-08", "name_prefix": "MRS.", "enumeration_date": "2007-03-21"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "PA", "code": "390200000X", "primary": true, "license": "", "desc": "Student in an Organized Health Care Education/Training Program"}], "addresses": [{"city": "SHIPPENSBURG", "address_2": "", "telephone_number": "814-441-6053", "state": "PA", "postal_code": "172571009", "address_1": "409 SCHOOLHOUSE LN", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "SHIPPENSBURG", "address_2": "", "state": "PA", "postal_code": "172571009", "address_1": "409 SCHOOLHOUSE LN", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1473984000, "identifiers": [], "other_names": [], "number": 1912455163, "last_updated_epoch": 1474032959, "basic": {"status": "A", "first_name": "BERNARD", "last_name": "SMACK", "last_updated": "2016-09-16", "name": "SMACK BERNARD", "sole_proprietor": "NO", "gender": "M", "enumeration_date": "2016-09-16"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "", "code": "146N00000X", "primary": true, "license": "E3022364", "desc": "Emergency Medical Technician, Basic"}], "addresses": [{"city": "TACOMA", "address_2": "", "telephone_number": "253-968-1110", "state": "WA", "postal_code": "984310001", "address_1": "9040 JACKSON AVE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "TACOMA", "address_2": "ATTN: MCHJ-CLQ-C", "state": "WA", "postal_code": "984311100", "address_1": "9040 JACKSON AVENUE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1495411200, "identifiers": [], "other_names": [{"credential": "EMT-B", "first_name": "ASHLEY", "last_name": "STINGER-DRUM", "middle_name": "ELISE", "prefix": "MS.", "code": "1", "type": "Former Name"}], "number": 1225565161, "last_updated_epoch": 1495466312, "basic": {"status": "A", "credential": "EMT-B", "first_name": "ASHLEY", "last_name": "SMACK", "middle_name": "ELISE", "name": "SMACK ASHLEY", "sole_proprietor": "NO", "gender": "F", "last_updated": "2017-05-22", "name_prefix": "MRS.", "enumeration_date": "2017-05-22"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "PA", "code": "224Z00000X", "primary": false, "license": "OP006681", "desc": "Occupational Therapy Assistant"}, {"state": "NY", "code": "224Z00000X", "primary": true, "license": "006890-1", "desc": "Occupational Therapy Assistant"}], "addresses": [{"city": "CHEEKTOWAGA", "address_2": "", "telephone_number": "716-656-9396", "state": "NY", "postal_code": "142273022", "address_1": "78 STRASBOURG DR", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "CHEEKTOWAGA", "address_2": "", "telephone_number": "716-656-9396", "state": "NY", "postal_code": "142273022", "address_1": "78 STRASBOURG DR", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1236556800, "identifiers": [], "other_names": [], "number": 1013158740, "last_updated_epoch": 1236556800, "basic": {"status": "A", "credential": "COTA", "first_name": "REBECCA", "last_name": "SMACZNIAK", "last_updated": "2009-03-09", "name": "SMACZNIAK REBECCA", "gender": "F", "sole_proprietor": "NO", "enumeration_date": "2009-03-09"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "FL", "code": "225X00000X", "primary": true, "license": "", "desc": "Occupational Therapist"}], "addresses": [{"city": "TAMPA", "address_2": "SUITE 601", "telephone_number": "813-371-3423", "state": "FL", "postal_code": "336091140", "address_1": "600 N WEST SHORE BLVD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "TAMPA", "address_2": "SUITE 601", "state": "FL", "postal_code": "336091140", "address_1": "600 N WEST SHORE BLVD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1319068800, "identifiers": [], "other_names": [], "number": 1164707295, "last_updated_epoch": 1319068800, "basic": {"status": "A", "first_name": "DEREK", "last_name": "SMACZNIAK", "middle_name": "JOSEPH", "name": "SMACZNIAK DEREK", "sole_proprietor": "YES", "gender": "M", "last_updated": "2011-10-20", "name_prefix": "MR.", "enumeration_date": "2011-10-20"}, "enumeration_type": "NPI-1"}]}
    		// console.log("data is " + JSON.stringify(data));
        	const modifiedData =  $.map(data.results, function (item) {
        		var img = 'https://asset1.betterdoctor.com/assets/general_doctor_male.png';

            	return {
                	label: item.basic.first_name + " " + item.basic.last_name,
                	value: item.basic.first_name + " " + item.basic.last_name,
                	credential: item.basic.credential,
                	npi: item.number,
                	// image_url: img,
            	};
        	});
        	// ef5a1b6152cee59bffefcb529005b8fd
        	
    	},
    	error: function (xhr, ajaxOptions, thrownError) {
    	console.log(thrownError);
    	}
	});

	
}


$('.doctorList').on('click', '.sbx-custom__reset2', function() {

    console.log($(this).parent().index());
    npiList.splice($(this).parent().index(), 1);
    doctorList.splice($(this).parent().index(), 1);
    $(this).parent().remove();
    renderCharts();
});

// function computeAutoComplete(data) {
	
	$('#autocomplete').autocomplete({
    	// lookup: getData(),// [{"label": "jolene", "value": "jolene", "credential": "sdfsdf", "npi":1231231231}, {"label": "nikhilesh", "value": "nikhilesh", "credential": "sdfsdf", "npi":1231231231, }],// {"result_count":10, "results":[{"taxonomies": [{"state": "OH", "code": "101Y00000X", "primary": false, "license": "C8224", "desc": "Counselor"}, {"state": "OH", "code": "101YM0800X", "primary": false, "license": "C8224", "desc": "Counselor Mental Health"}], "addresses": [{"city": "HEATH", "address_2": "", "telephone_number": "740-334-1823", "fax_number": "740-587-3657", "state": "OH", "postal_code": "430561402", "address_1": "581 HEBRON RD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "GRANVILLE", "address_2": "", "telephone_number": "740-334-1823", "fax_number": "740-587-3657", "state": "OH", "postal_code": "430230022", "address_1": "PO BOX 22", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1146441600, "identifiers": [], "other_names": [], "number": 1780641977, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "MA, PC", "first_name": "JOLENE", "last_name": "SMAAGE", "middle_name": "RAE", "name": "SMAAGE JOLENE", "gender": "F", "sole_proprietor": "NO", "last_updated": "2007-07-08", "enumeration_date": "2006-05-01"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MN", "code": "111N00000X", "primary": false, "license": "5354", "desc": "Chiropractor"}, {"state": "ND", "code": "111N00000X", "primary": true, "license": "1067", "desc": "Chiropractor"}], "addresses": [{"city": "GRAND FORKS", "address_2": "", "telephone_number": "701-757-1145", "fax_number": "701-757-1556", "state": "ND", "postal_code": "582032275", "address_1": "2860 10TH AVE N STE 200", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "GRAND FORKS", "address_2": "", "telephone_number": "701-757-1145", "fax_number": "701-757-1556", "state": "ND", "postal_code": "582032275", "address_1": "2860 10TH AVE N STE 200", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1363046400, "identifiers": [], "other_names": [], "number": 1265773519, "last_updated_epoch": 1510228373, "basic": {"status": "A", "credential": "D.C.", "first_name": "JENNA", "last_name": "SMABY", "middle_name": "RENEE", "name": "SMABY JENNA", "sole_proprietor": "NO", "gender": "F", "last_updated": "2017-11-09", "name_prefix": "DR.", "enumeration_date": "2013-03-12"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "OH", "code": "207R00000X", "primary": true, "license": "35050899-S", "desc": "Internal Medicine"}], "addresses": [{"city": "CLEVELAND", "address_2": "", "telephone_number": "216-368-2457", "fax_number": "216-368-8548", "state": "OH", "postal_code": "441061712", "address_1": "10900 EUCLID AVE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "SHAKER HEIGHTS", "address_2": "", "telephone_number": "216-751-6207", "state": "OH", "postal_code": "441201838", "address_1": "2854 SEDGEWICK RD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1175558400, "identifiers": [{"code": "05", "issuer": "", "state": "OH", "identifier": "0709531", "desc": "MEDICAID"}], "other_names": [{"credential": "M.D.", "first_name": "KATHY", "last_name": "SMACHLO", "middle_name": "ANNE", "prefix": "DR.", "code": "5", "type": "Other Name"}], "number": 1699896696, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "M.D.", "first_name": "KATHLEENE", "last_name": "SMACHLO", "middle_name": "ANNE", "name": "SMACHLO KATHLEENE", "sole_proprietor": "NO", "gender": "F", "last_updated": "2007-07-08", "name_prefix": "DR.", "enumeration_date": "2007-04-03"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MN", "code": "163W00000X", "primary": false, "license": "R 188589-7", "desc": "Registered Nurse"}, {"state": "MN", "code": "363LG0600X", "primary": false, "license": "CNP 3712", "desc": "Nurse Practitioner Gerontology"}, {"state": "MN", "code": "363LA2200X", "primary": true, "license": "CNP 3712", "desc": "Nurse Practitioner Adult Health"}], "addresses": [{"city": "COON RAPIDS", "address_2": "", "telephone_number": "763-780-8155", "state": "MN", "postal_code": "554335841", "address_1": "9055 SPRINGBROOK DR NW", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "MINNEAPOLIS", "address_2": "", "telephone_number": "612-262-5000", "state": "MN", "postal_code": "554071321", "address_1": "2925 CHICAGO AVENUE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1423785600, "identifiers": [], "other_names": [{"last_name": "PRY", "middle_name": "KATHLEEN", "first_name": "ANGELA", "code": "1", "type": "Former Name"}], "number": 1346631280, "last_updated_epoch": 1425340800, "basic": {"status": "A", "credential": "NP", "first_name": "ANGELA", "last_name": "SMACIARZ", "middle_name": "KATHLEEN", "name": "SMACIARZ ANGELA", "gender": "F", "sole_proprietor": "NO", "last_updated": "2015-03-03", "enumeration_date": "2015-02-13"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MD", "code": "207ND0101X", "primary": false, "license": "D0040409", "desc": "Dermatology MOHS-Micrographic Surgery"}, {"state": "MD", "code": "207NS0135X", "primary": false, "license": "D0040409", "desc": "Dermatology Procedural Dermatology"}, {"state": "MD", "code": "207N00000X", "primary": true, "license": "D0040409", "desc": "Dermatology"}], "addresses": [{"city": "EASTON", "address_2": "SUITE 2, 2ND FLOOR", "telephone_number": "410-822-9890", "fax_number": "410-763-9536", "state": "MD", "postal_code": "216014066", "address_1": "5 CAULK LANE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "EASTON", "address_2": "", "telephone_number": "410-822-9890", "fax_number": "410-763-9536", "state": "MD", "postal_code": "216018945", "address_1": "PO BOX 2350", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1129161600, "identifiers": [{"code": "01", "issuer": "CLIA", "state": "MD", "identifier": "21D0931132", "desc": "Other"}, {"code": "01", "issuer": "MAMSI PLANS", "state": "MD", "identifier": "248038", "desc": "Other"}, {"code": "01", "issuer": "MC RAILROAD", "state": "MD", "identifier": "070010482", "desc": "Other"}, {"code": "01", "issuer": "BLUE SHIELD", "state": "MD", "identifier": "KB59TA", "desc": "Other"}, {"code": "01", "issuer": "BLUE SHIELD", "state": "MD", "identifier": "W0170001", "desc": "Other"}], "other_names": [], "number": 1073501912, "last_updated_epoch": 1445867546, "basic": {"status": "A", "credential": "MD", "first_name": "DAVID", "last_name": "SMACK", "middle_name": "PHILLIPS", "name": "SMACK DAVID", "gender": "M", "sole_proprietor": "YES", "last_updated": "2015-10-26", "enumeration_date": "2005-10-13"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "MD", "code": "1041C0700X", "primary": true, "license": "11474", "desc": "Social Worker Clinical"}], "addresses": [{"city": "GLEN BURNIE", "address_2": "", "telephone_number": "410-768-2719", "fax_number": "410-424-2983", "state": "MD", "postal_code": "210615613", "address_1": "1419 MADISON PARK DR", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "BALTIMORE", "address_2": "", "state": "MD", "postal_code": "212393501", "address_1": "5200 LEITH RD APT C", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1174435200, "identifiers": [], "other_names": [], "number": 1538285655, "last_updated_epoch": 1183852800, "basic": {"status": "A", "credential": "LCSW-C", "first_name": "STEPHANIE", "last_name": "SMACK", "middle_name": "D", "name": "SMACK STEPHANIE", "sole_proprietor": "YES", "gender": "F", "last_updated": "2007-07-08", "name_prefix": "MRS.", "enumeration_date": "2007-03-21"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "PA", "code": "390200000X", "primary": true, "license": "", "desc": "Student in an Organized Health Care Education/Training Program"}], "addresses": [{"city": "SHIPPENSBURG", "address_2": "", "telephone_number": "814-441-6053", "state": "PA", "postal_code": "172571009", "address_1": "409 SCHOOLHOUSE LN", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "SHIPPENSBURG", "address_2": "", "state": "PA", "postal_code": "172571009", "address_1": "409 SCHOOLHOUSE LN", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1473984000, "identifiers": [], "other_names": [], "number": 1912455163, "last_updated_epoch": 1474032959, "basic": {"status": "A", "first_name": "BERNARD", "last_name": "SMACK", "last_updated": "2016-09-16", "name": "SMACK BERNARD", "sole_proprietor": "NO", "gender": "M", "enumeration_date": "2016-09-16"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "", "code": "146N00000X", "primary": true, "license": "E3022364", "desc": "Emergency Medical Technician, Basic"}], "addresses": [{"city": "TACOMA", "address_2": "", "telephone_number": "253-968-1110", "state": "WA", "postal_code": "984310001", "address_1": "9040 JACKSON AVE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "TACOMA", "address_2": "ATTN: MCHJ-CLQ-C", "state": "WA", "postal_code": "984311100", "address_1": "9040 JACKSON AVENUE", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1495411200, "identifiers": [], "other_names": [{"credential": "EMT-B", "first_name": "ASHLEY", "last_name": "STINGER-DRUM", "middle_name": "ELISE", "prefix": "MS.", "code": "1", "type": "Former Name"}], "number": 1225565161, "last_updated_epoch": 1495466312, "basic": {"status": "A", "credential": "EMT-B", "first_name": "ASHLEY", "last_name": "SMACK", "middle_name": "ELISE", "name": "SMACK ASHLEY", "sole_proprietor": "NO", "gender": "F", "last_updated": "2017-05-22", "name_prefix": "MRS.", "enumeration_date": "2017-05-22"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "PA", "code": "224Z00000X", "primary": false, "license": "OP006681", "desc": "Occupational Therapy Assistant"}, {"state": "NY", "code": "224Z00000X", "primary": true, "license": "006890-1", "desc": "Occupational Therapy Assistant"}], "addresses": [{"city": "CHEEKTOWAGA", "address_2": "", "telephone_number": "716-656-9396", "state": "NY", "postal_code": "142273022", "address_1": "78 STRASBOURG DR", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "CHEEKTOWAGA", "address_2": "", "telephone_number": "716-656-9396", "state": "NY", "postal_code": "142273022", "address_1": "78 STRASBOURG DR", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1236556800, "identifiers": [], "other_names": [], "number": 1013158740, "last_updated_epoch": 1236556800, "basic": {"status": "A", "credential": "COTA", "first_name": "REBECCA", "last_name": "SMACZNIAK", "last_updated": "2009-03-09", "name": "SMACZNIAK REBECCA", "gender": "F", "sole_proprietor": "NO", "enumeration_date": "2009-03-09"}, "enumeration_type": "NPI-1"},{"taxonomies": [{"state": "FL", "code": "225X00000X", "primary": true, "license": "", "desc": "Occupational Therapist"}], "addresses": [{"city": "TAMPA", "address_2": "SUITE 601", "telephone_number": "813-371-3423", "state": "FL", "postal_code": "336091140", "address_1": "600 N WEST SHORE BLVD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "LOCATION"}, {"city": "TAMPA", "address_2": "SUITE 601", "state": "FL", "postal_code": "336091140", "address_1": "600 N WEST SHORE BLVD", "country_code": "US", "country_name": "United States", "address_type": "DOM", "address_purpose": "MAILING"}], "created_epoch": 1319068800, "identifiers": [], "other_names": [], "number": 1164707295, "last_updated_epoch": 1319068800, "basic": {"status": "A", "first_name": "DEREK", "last_name": "SMACZNIAK", "middle_name": "JOSEPH", "name": "SMACZNIAK DEREK", "sole_proprietor": "YES", "gender": "M", "last_updated": "2011-10-20", "name_prefix": "MR.", "enumeration_date": "2011-10-20"}, "enumeration_type": "NPI-1"}]},
    	serviceUrl: '/data',
    	onSelect: function (suggestion) {
    		$('#autocomplete').val('');
    		
    		doctorList.push(suggestion);
    		npiList.push(suggestion.npi);

    		var inHTML = ""
    		$.each(doctorList, function(index, value){
    			// var newItem = "<div class='row doctor'><p class='col' style='font-weight: 300; flex:'0.7'>"+ doctorList[index].label + "</p> <button type='reset' title='Clear the search query.'' class='sbx-custom__reset2 col' style='flex:0.3'><svg role='img' aria-label='Reset'> <use xmlns:xlink='http://www.w3.org/1999/xlink' xlink:href='#sbx-icon-clear-3'></use></svg></button></div>";
                var newItem =  $('.doctorWrapper');
                $('.doctor .doctorName').text(doctorList[index].label);
               
    			inHTML += newItem.html(); 
			});

			$(".doctorList .col").html(inHTML);
			
            renderCharts();
			
    	},
 
	});
//}
function renderCharts() {
	var npis = npiList.toString();
	$('#chart1').attr('src', 'http://docharts.niksingh.net/?npi=' + npis);
	$('#chart2').attr('src', 'http://docharts.niksingh.net/?npi=' + npis + '&type=2');
	// $('#chart3').attr('src', 'http://docharts.niksingh.net/?npi=' + npis);
}
function print(msg, val) {
	console.log(msg + " " + JSON.stringify(val));
}