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

	addToPlaylist(url,title){
		let obj = {
			url:url,
			title:title
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
		console.log('playing index: '+index);
		let audio;
		
		if(index >=0 && index < this.playList.length){
			console.log("playing: "+this.playing);
			if(index == this.playIndex && this.playing === true)
				return 0;
			
			this.playIndex = index;

			if(this.stream)
				this.stopPlay();
			this.stream = youtubeStream(this.getUrl(index));
			this.playing = true;
			this.stream.on('end', () => setTimeout(()=>{
				console.log('track ended');
				this.stopPlay();
				this.nextTrack();
			}, 12000));
			this.stream.on('error',(error)=>console.log(error));
			this.client.voiceConnection.playRawStream(this.stream).then(() => {
				console.log(this.playList[this.playIndex].title);
				console.log(typeof this.playList[this.playIndex].title)
				return this.playList[this.playIndex].title;
			});
			
		}
		return -1;

	}

	playUrl(url){
		const getInfoAsync = Promise.promisify(ytdl.getInfo);
		getInfoAsync(url).then(info=>{
			if(info.title){
				this.addToPlaylist(url,info.title);
			}
		}).then(()=>{
			if(this.playList.length == 1){
				console.log('playing first song');
				return this.play(this.playIndex);
			}
		});

		
	}

	list(channel){
		const ret = '\n' + _.map(this.playList, (item, idx) =>{
			if(idx === this.playIndex) {
				return "->" + item.title;
			}
			return idx+") "+item.title;
		}).join('\n');
		this.client.sendMessage(channel, ret);
	}
}

