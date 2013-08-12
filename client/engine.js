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

	Class: Engine
	Main class of the application, have to be used like a singleton
*/
function Engine(){ }

/*
	Variable: width
	Engine width
	
	Variable: height
	Engine height
*/

/*
	First function to be called by your application
	@param width : viewport width
	@param height : viewport height
*/
Engine.init$3 = function(debug, width, height){
	var realSize = getScreenSize_js();
	Engine.resizeRatio = 0;
	if (width > realSize[0]){
		Engine.resizeRatio = Math.round(realSize[0] / width * 1000) / 1000;
	}else{
		if (Engine.phone){
			Engine.resizeRatio = Math.round(realSize[0] / width * 1000) / 1000;
		}else
			Engine.resizeRatio = 1;
	}
	if (height * Engine.resizeRatio > realSize[1]){
		Engine.resizeRatio = Math.round(realSize[1] / height * 100) / 100;
	}
	Engine.width = width;
	Engine.height = height;
	setCanvasSize(Engine.width,Engine.height);
	Engine.__timeout = 33;	/* Engine playing around 30fps */
	DEBUG_MODE = debug;
	Engine.bgColor.r = 0;
	Engine.bgColor.g = 0;
	Engine.bgColor.b = 0;
	Engine.timerInfo = new TimeAlarm(2000, false);
},

/*
*/
Engine.init$1 = function(debug){
	var realSize = getScreenSize_js();
	this.init$3(debug,realSize[0],realSize[1]);
},

/*
*/
Engine.init$0 = function(){
	var realSize = getScreenSize_js();
	this.init$3(false,realSize[0],realSize[1]);
},

/*
	Function: init
	*static*
	Initialize Frame-Engine, first method to call in your setup function
	
	Parameters:
	debug - optional, false by default
	width - optional, screen width  by default
	height - optional, screen height  by default
*/
Engine.init = function(){
	if (this['init$' + arguments.length])
		this['init$' + arguments.length].apply(this,arguments);
	else if (window.DEBUG_MODE)
		console.error("Unable to initialize the engine with this arguments call");
},

/*
	Load an area from is database id
*/
Engine.loadArea = function(id){
	var eca = Engine.currentArea;
	if (eca == null)
		eca = new Area();
	eca.loadArea(id);
},

/*
	Function: setCurrentArea
	*static*
	Set the current area to display : use in setup() function
	
	Parameters:
	a - area
*/
Engine.setCurrentArea = function(a){
	a.reset();
	Engine.keyPressHandlers = [];
	Engine.clickHandlers = [];
	Engine.focusHandlers = [];
	Engine.mouseOverHandlers = [];
	Engine.dragHandlers = [];
	Engine.resetSound();
	a.init();
	Input.setCursor('default');
	Engine.currentArea = a;
},

/*
	Function: changeArea
	*static*
	Change the current displayed area with a transition effet
	
	Parameters:
	a - new area
*/
Engine.changeArea = function(a){
	a.reset();
	Engine.keyPressHandlers = [];
	Engine.clickHandlers = [];
	Engine.focusHandlers = [];
	Engine.mouseOverHandlers = [];
	Engine.dragHandlers = [];
	Engine.resetSound();
	a.init();
	Input.setCursor('default');
	Engine.newArea = a;
},

	
/*
	Function: setCurrentRoom
	*static*
	
	Set a network room
	
	Parameters:
	r - room class instance
*/
Engine.setCurrentRoom = function(r){
	Engine.room = r;
},

/*
	Render the application on the canvas
*/
Engine.render = function(){
	var e = Engine;
	if (e.paused){
		DEBUG_MODE && console.info("Render paused");
		return;
	}
	var eca = Engine.currentArea;
	var timestamp = millis();
	var ew = Engine.width;
	var eh = Engine.height;
	e.__renderSpeed = timestamp - e.__lastRenderTry;
	e.__lastRenderTry = timestamp;
	if (!Engine.newArea && eca && eca.state == Area.LOADED){
		var notSkipFrame = timestamp <= e.__nextRenderTime + e.__renderSpeed;
		eca.render();
		e.__lastRenderTime = millis();
		e.__realFPSCompute[1]++;
		if (notSkipFrame && e.__lastRenderTime - e.__realFPSCompute[0] >= 1000){
			e.__realFPSCompute[0] = e.__lastRenderTime;
			e.__realfps = e.__realFPSCompute[1];
			e.__realFPSCompute[1] = 0;
		}
		e.__nextRenderTime = e.__lastRenderTime + e.__timeout;
		if (!notSkipFrame){ 
			window.requestAnimFrame(Engine.render);
			return;
		}
		
		/* */
		e.room && e.room.process();
		if (e.info){
			if (!e.timerInfo.itsTime()){
				textSize(20);
				var s = textWidth(e.info);
				fill(50,50,50, 0.8);
				rect((e.width + s )* 0.5 - 10, 100, s + 20, 25, 10);
				fill(255,255,255);
				text(e.info, (e.width + s) * 0.5, 130);
			}else{
				e.info = null;
			}
		}

	}else if (eca) {
		eca.isReady();
		e.loading(floor(eca.percentReady * 100));
	}
	
	if (e.newArea){
			eca.reset();
			Engine.currentArea = e.newArea;
			e.newArea = null;
	}
	Input.displayCursor();
	
	if (Engine.isFlashing){
		fill(Engine.isFlashing.red,Engine.isFlashing.green,Engine.isFlashing.blue, Engine.isFlashing.alpha);
		rect(0,0,Engine.width,Engine.height);
		if (Engine.isFlashing.c >= 10)
			Engine.isFlashing = null;
		else
			Engine.isFlashing.c++;
	}
	
	if (DEBUG_MODE){
		fill(0,0,0,0.8);
		rect(0,30,100,20);
		fill(255,255,255);
		text("FPS : " + floor(e.__realfps), 15, 40);
	}
	!window.phone && e.realContext.drawImage(e.bufferCanvas,0,0,e.width,eh);
	window.requestAnimFrame(Engine.render);
}

/*
	Function: loading
	*static*
	Display current loading state, overide this method to display your own loading screen
	
	Parameters:
	percent - percent loaded
*/
Engine.loading = function(percent){
	fill(0,0,0);
	rect(0,0, Engine.width, Engine.height);
	fill(255,255,255);
	text("Loading : " + percent + "%", Engine.width * 0.5,Engine.height * 0.5)
}

/*
	Function: setBackgroundColor
	*static*
	Set an uniform background color
	
	Parameters:
	r - red
	g - green
	b - blue
*/
Engine.setBackgroundColor = function(r,g,b){
	Engine.bgColor = color(r,g,b);
}
/*
	Function: setAlwaysRefresh
	*static*
	If alwaysRefresh is set at true, the motor will clean the screen at each iteration
	
	Parameters:
	yes - boolean
*/
Engine.setAlwaysRefresh = function(yes){
	Engine.alwaysRefresh = yes;
}

/*
	Function: flash
	*static*
	Draw an instant flash
	
	Parameters:
	red - red
	green - green
	blue - blue
	alpha - alpha
*/
Engine.flash = function( red, green, blue, alpha){
	Engine.isFlashing = { 'red' : red, 'green' : green, 'blue' : blue, 'alpha' : alpha, c : 0};
}

/*
	Function: isStarted
	*static*
	Return true if the motor is started
*/
Engine.isStarted = function(){
	return !Engine.paused;
}

/*
	Function: start
	*static*
	ReStart the render process, if process already started this function do nothing
*/
Engine.start = function(){
	Engine.paused = false;
	var tmp = millis();
	Engine.__renderSpeed = tmp;
	Engine.__lastRenderTime = tmp;
	Engine.__lastRenderTry = tmp;
	for (var i = Engine.currentArea.layers.size() - 1; i >= 0; i--){
		Engine.currentArea.layers.get(i).anim.endTime = Engine.currentArea.layers.get(i).anim.timeToReach + tmp;
	}
	for (var i = 0; i < Input.keysDown.length; i++){
		if (Input.keysDown[i]){
			Engine.dispatchKeyUpEvent(Input.keysDown[i]);
		}
	}
	if (Sound.music) {
		Engine.__playingSound.push(Sound.music);
		Engine.startMusic();
	}
	Engine.render();
}

/*
	Function: enableDebug
	*static*
	Enable debug mode
*/
Engine.enableDebug = function(){
	DEBUG_MODE = true;
}

/*
	Function: disableDebug
	*static*
	Disable debug mode
*/
Engine.disableDebug = function(){
	DEBUG_MODE = false;
}

/*
	Function: displayInfo
	*static*
	Display an info text
	
	Parameters:
	info - text to display
*/
Engine.displayInfo = function(info){
	Engine.info = info;
	Engine.timerInfo.reset();
}

Engine.displayOnPhone = function(){
	Engine.phone = true;
	Engine.pc = false;
}

Engine.displayOnTablet = function(){
	Engine.tablets = true;
	Engine.pc = false;
}

Engine.keyboard = function(){ 
	if (!Engine.keyboard.timer.itsTime()) return;
	if (Input.keysDown[KEY_F5]){
		refresh_js();
	}
}
Engine.keyboard.timer = new Timer(20);

Engine.textWidth = function(text){
	return Engine.context.measureText(text).width;
}

/*
	Function: pause
	*static*
	Pause current render
*/
Engine.pause = function(){
	Engine.paused = true;
	Engine.resetSound();
	for (var i = 0; i < Input.keysDown.length; i++){
		if(Input.keysDown[i]){
			Engine.dispatchKeyUpEvent(i);
		}
	}
}

Engine.keyPressHandlers = [];
Engine.clickHandlers = [];
Engine.focusHandlers = [];
Engine.mouseOverHandlers = [];
Engine.dragHandlers = [];

Engine.addKeyPressHandler = function(elem){
	Engine.keyPressHandlers.push(elem);
}

Engine.addClickHandler= function(elem){
	Engine.clickHandlers.push(elem);
}

Engine.addFocusHandler= function(elem){
	Engine.focusHandlers.push(elem);
}

Engine.addMouseOverHandler= function(elem){
	Engine.mouseOverHandlers.push(elem);
}

Engine.addDragHandler= function(elem){
	Engine.dragHandlers.push(elem);
}
Engine.removeDragHandlers = function(elem){
	Engine.dragHandlers.remove(elem);
}
Engine.dispatchDragEvent = function(){
	if (!Engine.dragHandlers.length) return;
	var i = Engine.dragHandlers.length;
	do{
		var tmp = Engine.dragHandlers[--i];
		if (BaseElement.isOver(tmp)){
			if (tmp.dragStarted){
				tmp.drag();
			}else{
				tmp.dragStarted = true;
				tmp.dragOffsetX = mouseX - tmp.x;
				tmp.dragOffsetY = mouseY - tmp.y;
				tmp.dragStart();
			}
			return;
		}
	}while(i);
}
Engine.dispatchDragStopEvent = function(){
	if (!Engine.dragHandlers.length) return;
	var i = Engine.dragHandlers.length;
	do{
		var tmp = Engine.dragHandlers[--i];
		if (tmp.dragStarted){
			tmp.dragStarted = false;
			tmp.dragStop();
			return;
		}
	}while(i);
}
Engine.dispatchClickEvent = function(){
	if(!Engine.clickHandlers.length) return;
	var i = Engine.clickHandlers.length;
	do{
		var tmp = Engine.clickHandlers[--i];
		if (BaseElement.isOver(tmp)){
			tmp.mouseDown();
			tmp.mouseClicked = true;
			return;
		}
	}while(i);
}
Engine.clearClickEvent = function(){
	if (!Engine.clickHandlers.length) return;
	var i = Engine.clickHandlers.length;
	do{
		var tmp = Engine.clickHandlers[--i];
		if (tmp && tmp.mouseClicked){
			tmp.mouseUp();
			tmp.mouseClicked = false;
		}
	}while(i);
}

Engine.dispatchKeyDownEvent = function(keyCode){
	if (!Engine.keyPressHandlers.length) return;
	var i = Engine.keyPressHandlers.length;
	do {
		Engine.keyPressHandlers[--i].keyDown(keyCode);
	}while(i);
}

Engine.dispatchKeyUpEvent = function(keyCode){
	if (!Engine.keyPressHandlers.length) return;
	var i = Engine.keyPressHandlers.length;
	do{
		Engine.keyPressHandlers[--i].keyUp(keyCode);
	}while(i);
}

Engine.dispatchFocusEvents = function(){
	if (!Engine.focusHandlers.length) return;
	var i = Engine.focusHandlers.length;
	do{
		var tmp = Engine.focusHandlers[--i];
		if (Engine.mousePressed && BaseElement.isOver(tmp)){
			if(!tmp.focused){
				tmp.focused = true;
				tmp.onFocus();
			} 
			return;
		}else if (tmp.focused && Engine.mousePressed && !BaseElement.isOver(tmp)){
			tmp.focused = false;
			tmp.onBlur();
			return;
		}
	}while(i);
}

Engine.dispatchMouseOverEvents = function (){
	if(!Engine.mouseOverHandlers.length) return;
	var i = Engine.mouseOverHandlers.length;
	do{
		var tmp = Engine.mouseOverHandlers[--i];
		if (BaseElement.isOver(tmp)){
			if (!tmp.mouseEntered){
				tmp.mouseEntered = true;
				tmp.mouseEnter();
			}else{
				tmp.mouseOver();
			}
			return;
		}else if (tmp.mouseEntered){
			tmp.mouseEntered = false;
			tmp.mouseLeave();
			return;
		}
	}while(i);
};

Engine.addPlayingSound = function(s){
	Engine.__playingSound.push(s);
};

Engine.removePlaying = function(s){
	if (!Engine.__playingSound.length) return;
	var i = Engine.__playingSound.length;
	do{
		if (Engine.__playingSound[--i].sound_id == s.sound_id){
			Engine.__playingSound.remove(i);
			Sound.stop(s.sound_id);	
			return;
		}
	}while(i);
};

Engine.resetSound = function(){
	if (window.androidEngine)
		window.androidEngine.stopSounds();
	var s = Engine.__playingSound.pop();
	if(s){
		do{
			Sound.stop(s.sound_id);
			s = Engine.__playingSound.pop();
		}while(s);
	}
};

/* Function: stopMusic
	*static*
*/
Engine.stopMusic = function(){
	Engine.__musicOn = false;
	if (Sound.music) Sound.stopMusic();
}

/*
	Function: startMusic
	*static*
*/
Engine.startMusic = function(){
	Engine.__musicOn = true;
	if (Sound.music) Sound.startMusic();
}

/*
	Function: stopSound
	*static*
*/
Engine.stopSound = function(){
	Engine.__soundOn = false;
	Engine.resetSound();
}

/*
	Function: startSound
	*static*
*/
Engine.startSound = function(){
	Engine.__soundOn = true;
}

Engine.instanceName = "Engine";
Engine.NONE = 1;
Engine.FADE_OUT = 2;
Engine.FADE_IN = 3;
Engine.currentArea = null;
Engine.newArea = null; 
Engine.step = 0;
Engine.bgColor = {};
Engine.alwaysRefresh = true;
Engine.room = null;
Engine.timerInfo = null;
Engine.info = null;
Engine.resizeRatio = 1;
Engine.paused = false;
/*
	Variable: Engine.buttonPressed
	False if not pressed, 0...n for button pressed
*/
Engine.buttonPressed = false;
Engine.stroke = false;
Engine.fill = true;
Engine.prototype.constructor = Engine;
/*
	Variable: Engine.mousePressed
*/
Engine.mousePressed = false;
Engine.__lastRenderTime = 0;
Engine.__renderSpeed = 16;
Engine.__lastRenderTry = 0;
Engine.__realFPSCompute = [0,0];
Engine.realFPS = 0;
Engine.__nextRenderTime = 0;
Engine.__playingSound = [];
Engine.__soundOn = true;
Engine.__musicOn = true;
Engine.server_url = "";

/*
	Variable: window.mouseX
*/
/*
	Variable: window.mouseY
*/

/*
	Class: frameEngine
*/
var frameEngine = function(canvasId){
	var that = this;

	this.mouseDown = function(e){
		var engine = Engine;
		if (engine.paused) return;
		var w = window;
		engine.buttonPressed = e.button;
		engine.mousePressed = true;
		w.mouseX = e.clientX - that.offset[0];
		w.mouseY = e.clientY - that.offset[1];
		w.mouseX = w.mouseX / engine.resizeRatio;
		w.mouseY = w.mouseY / engine.resizeRatio;
		engine.dispatchClickEvent();
		engine.dispatchDragEvent();
		engine.dispatchFocusEvents();
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true
		if (e.preventDefault) e.preventDefault();
		e.returnValue = false;
	}
	
	this.mouseUp = function(e){
		var engine = Engine;
		if (engine.paused) return;
		engine.buttonPressed = false;
		engine.mousePressed = false;
		engine.clearClickEvent();
		engine.dispatchDragStopEvent();
		engine.dispatchFocusEvents();
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true
		if (e.preventDefault) e.preventDefault();
		e.returnValue = false;
	}
	
	this.mouseMove = function(e){
		var engine = Engine;
		if (engine.paused) return;
		var w = window;
		w.mouseX = e.clientX - that.offset[0];
		w.mouseY = e.clientY - that.offset[1];
		w.mouseX = w.mouseX / engine.resizeRatio;
		w.mouseY = w.mouseY / engine.resizeRatio;
		engine.dispatchMouseOverEvents();
		if (engine.mousePressed){
			engine.dispatchDragEvent();
		}
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true
		if (e.preventDefault) e.preventDefault();
		e.returnValue = false;
	}
	
	this.touchStart = function(e){
		var engine = Engine;
		if (engine.paused) return;
		engine.buttonPressed = e.button;
		engine.mousePressed = true;
		w.mouseX = e.touches[0].clientX - that.offset[0];
		w.mouseY = e.touches[0].clientY - that.offset[1];
		w.mouseX = w.mouseX / engine.resizeRatio;
		w.mouseY = w.mouseY / engine.resizeRatio;
		engine.mousePressed = true;
		engine.dispatchClickEvent();
		engine.dispatchDragEvent();
		engine.dispatchFocusEvents();
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true
		if (e.preventDefault) e.preventDefault();
		e.returnValue = false;
	}
	this.touchMove = function(e){
		var engine = Engine;
		if (engine.paused) return;
		var w = window;
		w.mouseX = e.touches[0].clientX - that.offset[0];
		w.mouseY = e.touches[0].clientY - that.offset[1];
		w.mouseX = w.mouseX / engine.resizeRatio;
		w.mouseY = w.mouseY / engine.resizeRatio;
		engine.dispatchMouseOverEvents();
		if (engine.mousePressed){
			engine.dispatchDragEvent();
		}
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true
		if (e.preventDefault) e.preventDefault();
		e.returnValue = false;
	}
	
	this.touchEnd = function(e){
		var engine = Engine;
		if (engine.paused) return;
		engine.buttonPressed = false;
		engine.mousePressed = false;
		engine.clearClickEvent();
		engine.dispatchDragStopEvent();
		engine.dispatchFocusEvents();
		if (e.stopPropagation) e.stopPropagation();
		e.cancelBubble = true
		if (e.preventDefault) e.preventDefault();
		e.returnValue = false;
	}
	var w = window;
	this.canvasId = canvasId;
	this.canvas = document.getElementById(this.canvasId);
	this.canvas.webkitImageSmoothingEnabled = true;
	this.canvas.mozImageSmoothingEnabled = true;
	w.checkDevice_js();
	w.setup();
	var tmp = getScreenSize_js();
	if (tmp[0] * 0.5 - Engine.width * Engine.resizeRatio * 0.5 > 0)
		frameHelper(this.canvas).css('left', (tmp[0] * 0.5 - Engine.width * Engine.resizeRatio * 0.5) + 'px');
	if (tmp[1] * 0.5 - Engine.height * Engine.resizeRatio * 0.5 > 0)
		frameHelper(this.canvas).css('top', (tmp[1] * 0.5 - Engine.height * Engine.resizeRatio * 0.5) + 'px');
	delete tmp;
	this.width = frameHelper(this.canvas).width();
	this.height = frameHelper(this.canvas).height();
	this.offset = frameHelper(this.canvas).offset();
	if (!w.phone){
		this.realContext = this.canvas.getContext("2d");
		this.bufferCanvas = document.createElement('canvas');
		this.bufferCanvas.width = this.width;
		this.bufferCanvas.height = this.height;
		this.bufferCanvas.webkitImageSmoothingEnabled = true;
		this.bufferCanvas.mozImageSmoothingEnabled = true;
		this.context = this.bufferCanvas.getContext('2d');
		this.canvas.addEventListener("mousedown", that.mouseDown, false);
		this.canvas.addEventListener("mouseup", that.mouseUp, false);
		this.canvas.addEventListener("mousemove", that.mouseMove,false);
	}else{
		this.context = this.canvas.getContext('2d');
		this.canvas.addEventListener("touchstart", that.touchStart, false);
		this.canvas.addEventListener("touchmove", that.touchMove, false); 
		this.canvas.addEventListener("touchend", that.touchEnd, false); 
	}
	
	var e = Engine;
	e.context = that.context;
	e.bufferCanvas = that.bufferCanvas;
	e.realWidth = that.width;
	e.realHeight = that.height;
	e.realContext = that.realContext;
	e.frameInstance = that;
	e.canvas = this.canvas;
	e.offsetLeft = this.offset[0];
	e.offsetTop = this.offset[1];
	window.requestAnimFrame = (function(){
		if (Engine.phone){
			return function(callback){
				window.setTimeout(callback, 16);
			};
		}else{
			return window.requestAnimationFrame ||
			window.webkitRequestAnimationFrame ||
			window.mozRequestAnimationFrame ||
			window.oRequestAnimationFrame ||
			window.msRequestAnimationFrame ||
			function(callback){
				window.setTimeout(callback, 33);
			};
		}
	})();
	this.canvas.style.width = floor(Engine.width * Engine.resizeRatio) + 'px';
	this.canvas.style.height = floor(Engine.height * Engine.resizeRatio) + 'px';
	
	e.render();
}