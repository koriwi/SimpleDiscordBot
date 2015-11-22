'use strict';

const Discord = require('discord.js');
const JokeFactory = require('./joke');
const Promise = require('bluebird');
const fs = Promise.promisifyAll(require('fs'));
const manifest = require('./credentials');
const ytStream = require('./youtube.js');

const bot = new Discord.Client();
const jokes = new JokeFactory();
let youtube = false;

let jokesReady = false;

jokes.loadJokes().then(() => {
	jokesReady = true;
	console.log('Loaded jokes, ready');
})

bot.login(manifest.email,manifest.pw)
.then(()=>{
	return new Promise((resolve,reject)=>{
		bot.once('ready',resolve);
		bot.once('error',reject);
	})
})
.then(() => {
	youtube = new ytStream(bot);
	const server = bot.servers.get('id','103456218546192384');
	console.log('ServerID: '+server.id)

	let defaultChannel = server.channels.get('name', 'bot')

	bot.on('message', message => {

	    if(message.content === 'ping')
	        bot.reply(message, 'pong',(e,m)=>{
	       		console.log('replied to '+message.author.username);
	        });

	    if(message.content === '!bot joke' && jokesReady == true){
	    	let joke = jokes.getJoke();
	    	let jokeText =  joke.question+'\n'+joke.answer;
	    	bot.sendMessage(message.channel, jokeText, (e,m)=>{
	       		console.log('replied to '+message.author.username);
	        });
	    }

	    if(message.content === '!bot antijoke' && jokesReady == true){
	    	let joke1 = jokes.getJoke();
	    	let joke2 = jokes.getJoke();
	    	let jokeText =  joke1.question+'\n'+joke2.answer;
	    	bot.sendMessage(message.channel, jokeText, (e,m)=>{
	       		console.log('replied to '+message.author.username);
	        });
	    }

	    if(message.content.indexOf("!bot joinvoice")> -1){
	    	const index = message.content.indexOf("!bot joinvoice")+("!bot joinvoice").length;
	    	const ch = message.content.substring(index).trim();
	    	let vchannel = server.channels.get('name',ch);
	    	
	    	if(vchannel){
	    		console.log(vchannel.name);
	    		bot.joinVoiceChannel(vchannel);
	    	}
	    		
	    }

	    if(message.content.indexOf("!bot playurl") > -1){
	    	if(!bot.voiceConnection){
	    		console.log("Voice not connected");	
	    	}else{
	    		const index = message.content.indexOf("!bot play")+("!bot play").length;
	    		const url = message.content.substring(index).trim();

	    		if(youtube.playUrl(url) < 0)
					bot.sendMessage(message.channel,"Maybe your link is wrong?");
	    		else
	    			bot.sendMessage(message.channel,"Added link"); 		
	    		
	    	}    			
	    }

	    if(message.content === '!bot stop'){
	    	youtube.stopPlay();
	    	bot.sendMessage(message.channel,"Stopping Youtube");
	    } 

	    if(message.content === '!bot >'){
	    	youtube.nextTrack();
	    }

	   	if(message.content === '!bot <'){
	    	youtube.prevTrack();
	    }

	   	if(message.content === '!bot playlist'){
	    	youtube.list(message.channel);
	    }
	});
	
}).catch(error => console.error(error));