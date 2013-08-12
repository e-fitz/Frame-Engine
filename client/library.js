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

*/
window.library = new HashMap();

window.timeToDispatch = 35;  /* Pour optimiser il faut declancher les evenements moins de 30fps */

window.EXIT_MESSAGE = "";

/* Debug mode */
window.DEBUG_MODE = true;
window.language = 'US';

if (navigator.browserLanguage)
	window.language = navigator.browserLanguage;
else if (navigator.language)
	window.language = navigator.language;
if (language.indexOf('fr') >= 0){
	window.language = 'fr';
}

/*
	Class: Library
	Static class containing library of ressources
*/
function Library(){
	this.instanceName = "Library";
}

/*
	Function: addImage
	Add an image to the library (load the image)
	
	Parameters:
	path - image path
*/
Library.addImage = function (path){
	if (DEBUG_MODE){
		if((path.toString()).indexOf(" ") > 0){
			console.warn("Library : image path " + path + " should not contain space");
		}
	}
	if (Library.get(path) == undefined){
		window.library.put(path, -1);
		Library.loadImage(path);
	}
}

/*
	Function: addObject
	Add an object into the library
	
	Parameters:
	name - key name
	o - object instance
*/
Library.addObject = function (name, o){
	window.library.put(name, o);
}

/*
	Function: get
	Return the loaded PImage from the library or null if not present
	
	Parameters:
	path - key path
*/
Library.get = function (path){
	return window.library.get(path);
}

/*
	Function: addSound
	Load MP3 sound file
	
	Parameters:
	path - key path
*/
Library.addSound = function (path){
	if (!window.library.get(path)){
		var sound = document.createElement('audio');
		if (window.canPlayMP3){
			path += ".mp3";
			sound.setAttribute('type','audio/mpeg');
		}else{
			path += ".ogg";
			sound.setAttribute('type','audio/ogg');
		}
		sound.setAttribute('src', path);
		sound.setAttribute('preload', 'auto');
		sound.load();
		window.library.put(path, sound);
	}
}

/*
	Function: loadImage
	Load an image into the library
	
	Parameters:
	path - path to the image
*/
Library.loadImage = function(path){
	var i = new Image();
	var p = path;
	i.src = path;
	frameHelper(i).load(function(){
		window.library.put(path, i);
	});
}
	
Library.prototype.constructor = Library;
