var cheerio = require('cheerio');
var request = require('request');
var _ = require('lodash');
var jokes = [];
for(i = 1;i<=72;i++){
	request('http://1a-flachwitze.de/beste/page/'+i,function(error,repsonse,body){
		$ = cheerio.load(body);
		
		var temp1 = $('.post > header > h2 > a');
		//console.log(temp1.children().children());
		var temp2 = $('.post > div > p');

		var jokeArray = [];

		_.forEach(temp1,function(e,i){
			jokeArray.push($(e).text().trim());
			jokeArray.push($(temp2[i]).text().trim());
			console.log($(e).text().trim());
			console.log($(temp2[i]).text().trim());
		});
		
		jokes.push(jokeArray);
	})
}
