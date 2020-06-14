const express = require('express')
const app = express()
const port = process.env.PORT || '8000';
const path = require('path');
var cors = require('cors')
var request=require('request');

app.use(cors())
app.use(express.static(__dirname + '/assets'));

app.all('/*', function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  next();
});


app.get('/', (req, res) => {
     res.sendFile(path.join(__dirname+'/index.html'));
})


app.get('/data', (req, res) => {
	var query = [];

	var fName = req.query.fName;
	var lName = req.query.lName;
	
	getData(fName, lName).then(function(first_result) {

		// // query.concat(first_result);
		// console.log(JSON.stringify(first_result).results);
		// query = JSON.parse(first_result);
		// query = JSON.stringify(query.results);

		// getData(lName, fName).then(function(second_result) {
		// 	// console.log(JSON.parse(second_result).results);
		// 	second_result = JSON.parse(second_result);
		// 	second_result = JSON.stringify(second_result.results);
		// 	// console.log(JSON.parse(query));
		// 	// query = JSON.parse(query);
		// 	// for(var item in second_result) {
		// 	// 	query.concat(item);
		// 	// }
		
			res.end(first_result);
		// })
	});


});


function getData(fName, lName){
  return new Promise(function (fulfill, reject){
  	request.get('https://npiregistry.cms.hhs.gov/api?first_name=' + fName + '&last_name=' + lName + '&pretty=true',function(err,re,body){
  		if(err) reject(err);
  		else fulfill(body);

	})

  });
}


app.listen(port, (err) => {
  if (err) {
    return console.log('something bad happened', err)
  }

  console.log(`server is listening on ${port}`)
})