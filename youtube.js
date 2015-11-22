'use strict'

const youtubeStream = require('youtube-audio-stream');
const _ = require('lodash');

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

	addToPlaylist(url){
		this.playList.push(url);
		console.log('pushed to playlist, length: '+this.playList.length);
	}

	nextTrack(){
		if(this.playIndex+1 <= this.playList.length-1){
			this.playIndex += 1;
			this.play(this.playIndex);			
		}else
			if(!this.stream){
				this.playing = false;
				console.log('no more songs to play');
			}		
	}

	prevTrack(){
		if(this.playIndex-1 >= 0){
			this.playIndex -= 1;
			this.play(this.playIndex);
		}else
			if(!this.stream){
				this.playing = false;
				console.log('no more songs to play');
			}
	}

	getUrl(index){
		return this.playList[index];
	}

	play(index){
		console.log('playing index: '+index);
		let audio;
		if(this.stream)
			this.stopPlay();
		try{
			this.stream = youtubeStream(this.getUrl(index));
			this.playing = true;
			this.stream.on('end', () => setTimeout(()=>{
				console.log('track ended');
				this.stopPlay();
				this.nextTrack();
			}, 12000));
			this.stream.on('error',(error)=>console.log(error));
			this.client.voiceConnection.playRawStream(this.stream).then(() => {return 1;});
		}catch(error){
			console.error(error.stack
				);
			this.playList.splice(this.playIndex,1);
			this.nextTrack();
			return -1;
		}
	}

	playUrl(url){
		this.addToPlaylist(url);
		if(this.playList.length == 1){
			console.log('playing first song');
			return this.play(this.playIndex);
		}
		if(this.playing == false){
			this.nextTrack();
		}
	}

	list(channel){
		const ret = '\n' + _.map(this.playList, (item, idx) =>{
			if(idx === this.playIndex) {
				return "->" + item;
			}
			return idx+") "+item;
		}).join('\n');
		this.client.sendMessage(channel, ret);
	}
}

