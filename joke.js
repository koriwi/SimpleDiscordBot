"use strict";

const cheerio = require('cheerio');
const Promise = require('bluebird');	
const request = Promise.promisify(require('request'), {multiArgs:true});
const _ = require('lodash');

  

module.exports = class JokeFactory{

	constructor(){

	}

	loadJokes(){

		const urls = _.times(72, it=>'http://1a-flachwitze.de/beste/page/'+it);

		return Promise.map(urls, url=>{
			return request(url)
			.spread((response,body)=>{
				const $ = cheerio.load(body);
				const containers = _.map($('article'),$);

				return _.map(containers, el=>({
					question: el.find('h2.entry-title').text().trim(),
					answer : el.find('div.entry-summary > p').text().trim()
				}))
			})
		},{concurrency:4}).then(_.flatten).then(data=>{this.jokes = data});
	}

	getJoke(){
		return _.sample(this.jokes);
	}
}

