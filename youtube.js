"use strict"

const youtubeStream = require('youtube-audio-stream');


module.exports = class ytStream{

	constructor(){
		this.stream = false;
	}

	stopPlay(client){

		if(client.voiceConnection && this.stream){
			stream.end();
			client.voiceConnection.stopPlaying();
		}
	
	}

	playUrl(url,client){
		let audio;
		try{
			this.stream = youtubeStream(url);
			this.stream.on('end', () => setTimeout(stopPlay, 8000));
    		this.stream.on('error',(error)=>console.log(error));
    		client.voiceConnection.playRawStream(this.stream).then(finished => {
    			return 1;
    		});
		}catch(error){
			console.log(error);
			return -1;
		}
	}

}

