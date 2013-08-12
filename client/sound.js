/*
Copyright (C) 2013 Dourthe Aymeric

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see [http://www.gnu.org/licenses/].

	Class: Sound
	Provide an easy way to play mp3 sound
*/
var Sound = {}

Sound.currentlyPlaying = [];
Sound.map = new HashMap();

/*
	Function: play
	Play the sound instance, return current playing sound id
	
	Parameters:
	path - sound path without file extension
	
	Return: Sound id
*/
Sound.play = function(path){
	if (!Sound.enabled) return;
	if (window.canPlayMP3){
		path += ".mp3";
	}else{
		path += ".ogg";
	}
	if (Sound.map.get(path)){
		var s = Sound.map.remove(path);
		s.pause();
		s.currentTime = 0;
		s.play();
		Sound.currentlyPlaying[s.sound_id] = s;
	}else{
		var s = document.createElement('audio');
		s.sound_id = Sound.currentId++;
		Sound.currentlyPlaying[s.sound_id] = s;
		if (window.canPlayMP3){
			Sound.currentlyPlaying[s.sound_id].setAttribute('type','audio/mpeg');
		}else{
			Sound.currentlyPlaying[s.sound_id].setAttribute('type','audio/ogg');
		}
		Sound.currentlyPlaying[s.sound_id].setAttribute('src', path);
		Sound.currentlyPlaying[s.sound_id].path = path;
		Sound.currentlyPlaying[s.sound_id].setAttribute('preload', 'auto');
		Sound.currentlyPlaying[s.sound_id].load();
		s.addEventListener('canplay', function(){
			if(this.started) return;
			if (typeof(this.started) == 'undefined') this.started = true;
			Sound.currentlyPlaying[s.sound_id].play();
			Engine.addPlayingSound(Sound.currentlyPlaying[s.sound_id]);
		});
		s.addEventListener('ended', function(){ 
			Engine.removePlaying(Sound.currentlyPlaying[s.sound_id]);
			Sound.map.put(Sound.currentlyPlaying[s.sound_id].path, Sound.currentlyPlaying[s.sound_id]);
			Sound.currentlyPlaying[s.sound_id] = null;
		}, false);
	}
	return s.sound_id;
}

Sound.currentId = 0;

/*
	Function: playMusic
	Play a backgound music
	
	Parameters
	path - path to the file without file extension
	loop - boolean
*/
Sound.playMusic = function(path, loop){
	if (!Sound.enabled) return;
	var tmp = Engine.__soundOn;
	Engine.__soundOn = true;
	var id = Sound.play(path);
	Engine.__soundOn = tmp;
	if (loop)
		Sound.currentlyPlaying[id].loop = loop;
	Sound.music = Sound.currentlyPlaying[id];
}

/*
	Function: startMusic
*/
Sound.startMusic = function(){
	if (Sound.music){
		Sound.music.play();
	}
}

/*
	Function: stopMusic
*/
Sound.stopMusic = function(){
	if (Sound.music)
		Sound.music.pause();
}

/*
	Stop the sound
*/
Sound.stop  = function(id){
	Sound.currentlyPlaying[id].pause();
}

/*
	Function: goTo
	Move in the sound file
	
	Parameters:
	id - sound id
	seconds - position
*/
Sound.goTo = function(id, seconds){
	Sound.currentlyPlaying[id].currentTime=seconds; 
}

/*
	Function: fadeOut
	Apply fadeOut effect to the sound
*/
Sound.fadeOut = function(id){
	Sound.currentlyPlaying[id].volume -= 0.05;
	if (Sound.currentlyPlaying[id].volume > 0)
		window.setTimeout(function(){Sound.fadeOut(id); }, 10);
}

/*
	Function: disable
	Disable sound playing (music too)
*/
Sound.disable = function(){
	Sound.enabled = false;
}

/* Function: enable
	Enable sound playing (music too)
*/
Sound.enable = function(){
	Sound.enabled = true;
}

/*
	Function: isEnabled
	Return true if sound is enabled
*/
Sound.isEnabled = function(){
	return Sound.enabled;
}

Sound.enabled = true;