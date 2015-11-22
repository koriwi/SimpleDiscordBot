"use strict"

const youtubeStream = require('youtube-audio-stream');


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
			this.stream.end();
			this.client.voiceConnection.stopPlaying();
			console.log("stopped playing youtube");
		}
	}

	addToPlaylist(url){
		this.playList.push(url);
		console.log("pushed to playlist, length: "+this.playList.length);
	}

	nextTrack(){
		if(this.playIndex+1 <= this.playList.length-1){
			this.playIndex += 1;
			this.playing = true;
			this.play(this.playIndex);			
		}else
			this.playing = false;
			

	}

	prevTrack(){
		if(this.playIndex-1 >= 0){
			this.playIndex -= 1;
			this.play(this.playIndex);
		}else
			this.playing = false;
			
	}

	getUrl(index){
		return this.playList[index];
	}

	play(index){
		console.log("playing index: "+index);
		let audio;
		if(this.stream)
			this.stopPlay();
		try{
			this.stream = youtubeStream(this.getUrl(index));
			this.stream.on('end', () => setTimeout(this.nextTrack(), 10000));
    		this.stream.on('error',(error)=>console.log(error));
    		this.client.voiceConnection.playRawStream(this.stream).then(finished => {
    			return 1;
    		});
		}catch(error){
			console.log("CAREFULL");
			console.log(error);
			this.playList.splice(this.playIndex,1);
			this.nextTrack();
			return -1;
		}
	}

	playUrl(url){
		this.addToPlaylist(url);
		if(this.playList.length == 1){
			console.log("playing first song");
			return this.play(this.playIndex);
		}
		if(this.playing == false){
			this.nextTrack();
		}
			
	}

}

