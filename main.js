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

function getParam(msg){
	const temp = msg.split(' ');
	let par = temp.slice();
	par.splice(0,2);
	
	let param = {
		recipient: temp[0],
		task: temp[1],
		params: par
	}
	console.log("parameter: "+param.params);
	return param;
}

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
	const server = bot.servers.get('id',manifest.serverid);
	console.log('ServerID: '+server.id)

	let defaultChannel = server.channels.get('name', 'bot')

	bot.on('message', message => {

		let params = getParam(message.content);
		console.log(params);
		if(params.recipient === '!bot'){
			if(message.content === 'ping')
				bot.reply(message, 'pong',(e,m)=>{
			   		console.log('replied to '+message.author.username);
				});

			if(params.task === 'joke' && jokesReady == true){
				let joke = jokes.getJoke();
				let jokeText =  joke.question+'\n'+joke.answer;
				bot.sendMessage(message.channel, jokeText, (e,m)=>{
			   		console.log('replied to '+message.author.username);
				});
			}

			if(params.task === 'antijoke' && jokesReady == true){
				let joke1 = jokes.getJoke();
				let joke2 = jokes.getJoke();
				let jokeText =  joke1.question+'\n'+joke2.answer;
				bot.sendMessage(message.channel, jokeText, (e,m)=>{
			   		console.log('replied to '+message.author.username);
				});
			}

			if(params.task === 'joinvoice'){
				let vchannel = server.channels.get('name',params.params.join(' ').trim());
				
				if(vchannel){
					console.log(vchannel.name);
					bot.joinVoiceChannel(vchannel);
				}
					
			}

			if(!bot.voiceConnection){
				console.log("Voice not connected");
			}else{
				if(params.task === 'playurl'){
					youtube.playUrl(params.params[0])
					.then(title=>{
						bot.sendMessage(message.channel,"Added "+title);
					});
						
													
				}

				if(params.task === 'stop'){
					youtube.stopPlay();
					bot.sendMessage(message.channel,"Stopping Youtube");
				} 

				if(params.task === '>'){
					youtube.nextTrack();
				}

			   	if(params.task === '<'){
					youtube.prevTrack();
				}

			   	if(params.task === 'playlist'){
					youtube.list(message.channel);
				}

				if(params.task ==='play'){
					getParam(message.content);
					youtube.play(params.params[0]).then((title)=> {
						bot.sendMessage(message.channel,"Playing "+title);
					}).catch(error=>{
						console.error(error);
					});
				}
			}
		}
		
	});
	
}).catch(error => console.error(error.stack));