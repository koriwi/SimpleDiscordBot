'use strict';

const Discord = require('discord.js');
const youtubeStream = require('youtube-audio-stream')
const JokeFactory = require('./joke');
const Promise = require('bluebird');
const readJSON = require('read-json');

const bot = new Discord.Client();
const jokes = new JokeFactory();

let jokesReady = false;
let stream = false;


function stopPlay(){
	try{
		if(bot.voiceConnection && stream){
			stream.end();
			bot.voiceConnection.stopPlaying();
		}
	}catch(error){
		console.log(error);
	}
	
		
}

jokes.loadJokes().then(() => {
	jokesReady = true;
	console.log('Loaded jokes, ready');
})


new Promise((resolve,reject)=>{
	readJSON('./credentials.json',(error,manifest)=>{
		bot.login(manifest.email,manifest.pw).then(()=>{
			return new Promise((resolve,reject)=>{
				bot.once('ready',resolve);
				bot.once('error',reject);
			})
		}).then(()=>resolve())
	})
})
.then(() => {

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

	    if(message.content.indexOf("!bot play") > -1){
	    	if(!bot.voiceConnection){
	    		console.log("voice not connected");	
	    	}else{
	    		stopPlay();
	    		console.log("Downloading...");

	    		const index = message.content.indexOf("!bot play")+("!bot play").length;
	    		const url = message.content.substring(index).trim();
	    		let audio;

	    		stream = youtubeStream(url);
	    		stream.on('end', () => setTimeout(stopPlay, 8000));
	    		stream.on('error',(error)=>console.log(error));
	    		//bot.voiceConnection.init();
	    		bot.voiceConnection.playRawStream(stream).then(finished => {
	    			bot.sendMessage(message.channel,"Playing Youtube");
	    		});
	    	}    			
	    }

	    if(message.content === '!bot stop'){
	    	stopPlay();
	    	bot.sendMessage(message.channel,"Stopping Youtube");
	    } 
	});
	
}).catch(error => console.error(error));