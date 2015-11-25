'use strict'

const youtubeStream = require('youtube-audio-stream');
const _ = require('lodash');
const ytdl = require('ytdl-core');
const Promise = require('bluebird');

module.exports = class ytStream{

	constructor(client){
		this.client = client;
		this.playIndex = 0;
		this.stream = false;
		this.playList = new Array();
		this.playing = false;
	}

	stopPlay(){
		if(this.client.voiceConnection && this.stream){
			this.client.voiceConnection.stopPlaying();
			this.playing = false;
			console.log('stop signal');
		}
	}

	addToPlaylist(item){
		let obj = {
			url:item.loaderUrl,
			title:item.title,
			seconds:item.length_seconds
		}
		if(this.playList.length === 10){
			this.playList.splice(0,1);
			this.playIndex += -1;
		}
			
		this.playList.push(obj);
		console.log('pushed to playlist, length: '+this.playList.length);
	}

	nextTrack(){
		if(this.playIndex+1 <= this.playList.length-1){
			this.play(this.playIndex+1);			
		}else{
			this.playing = false;
			console.log('no more songs to play');
		}		
	}

	prevTrack(){
		if(this.playIndex-1 >= 0)
			this.play(this.playIndex-1);
		else{
			this.playing = false;
			console.log('no more songs to play');
		}
	}

	getUrl(index){
		return this.playList[index].url;
	}

	play(index){
		index = parseInt(index);
		console.log('playing index: '+index);
		let audio;
		
		if(index <0 || index >= this.playList.length || index == 'NaN')
			return Promise.reject(new RangeError('Song not in playlist'));

		console.log('playing: '+this.playing);

		if(index === this.playIndex && this.playing === true)
			return Promise.reject(new Error('Song allready playing'));
		
		this.playIndex = index;

		if(this.stream)
			this.stopPlay();

		this.stream = youtubeStream(this.getUrl(index));
		this.playing = true;

		this.stream.on('error',(error)=>console.log(error));
		return this.client.voiceConnection.playRawStream(this.stream)
		.then((intent) => {
			intent.once('end',()=>{
				console.log('track ended');
				this.nextTrack();
			});		
			return this.playList[this.playIndex].title;
		}).catch(error=>{
			console.log(error.stack);
			throw error;
		});
		
	}

	playUrl(url){
		const getInfoAsync = Promise.promisify(ytdl.getInfo);
		return getInfoAsync(url).then(info=>{
			if(info.title){
				this.addToPlaylist(info);
			}
		}).then(()=>{
			if(this.playList.length == 1){
				console.log('playing first song');
				this.play(this.playIndex);
			}
			return this.playList[this.playList.length-1].title;
		});

		
	}

	list(channel){
		const ret = '\n' + _.map(this.playList, (item, idx) =>{
			if(idx === this.playIndex)
				return '->' + item.title;
			return idx+') '+item.title;
		}).join('\n');
		this.client.sendMessage(channel, ret);
	}
}

