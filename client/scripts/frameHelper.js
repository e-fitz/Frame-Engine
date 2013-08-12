var phone = false;
var DEBUG_MODE = false;
window.mousePressed = false;
window.keyPressed = false;
window.mouseX = -1;
window.mouseY = -1;
/*
	Native js function to obtain screen size
*/
function getScreenSize_js(){
	return [frameHelper('html').width(), frameHelper('html').height()];
}
function setCanvasSize(width,height){
	frameHelper('canvas').attr('width', width);
	frameHelper('canvas').attr('height', height);
}

/*
	Native js function to refresh the browser
*/
function refresh_js(){
	window.location.reload();
}

/*
	Native js function to well load your application
*/
frameHelper(window).load(function(){
	frameHelper(window).keydown(function(e){	
			Input.keyDown(e.keyCode);
			Engine.dispatchKeyDownEvent(e.keyCode);
			Engine.keyboard();
	});
	frameHelper(window).keyup(function(e){
		Input.keyEnd(e.keyCode);
		Engine.dispatchKeyUpEvent(e.keyCode);
	});
	
	window.addEventListener('blur', function(e){
		if (Engine.currentArea.isReady())
			Engine.pause();
	},false);
	
	window.addEventListener('focus' , function(e){
		Engine.start();
	}, false);
	
	if(window.DeviceMotionEvent != undefined){
		var lastMotionEvent = null;
		window.ondevicemotion = function(event) {
			if (lastMotionEvent == null){
				Input.setAcceleration(event.accelerationIncludingGravity.x,event.accelerationIncludingGravity.y,event.accelerationIncludingGravity.z);
			}else{
				Input.setAcceleration(event.accelerationIncludingGravity.x,event.accelerationIncludingGravity.y,event.accelerationIncludingGravity.z);
			}
			
		};
	}
	
});

function checkDevice_js(){
	/* Device type */
	if (navigator.userAgent.match(/Android/i) ||
		navigator.userAgent.match(/webOS/i) ||
		navigator.userAgent.match(/iPhone/i) ||
		navigator.userAgent.match(/iPad/i) ||
		navigator.userAgent.match(/iPod/i) ||
		navigator.userAgent.match(/BlackBerry/) || 
		navigator.userAgent.match(/Windows Phone/i) || 
		navigator.userAgent.match(/ZuneWP7/i)) {
		window.phone = true;
		Engine.phone = true;
		if (navigator.userAgent.match(/Android/i)){
			if (window.androidStorage)
				storage = window.androidStorage;
			if (window.androidSound)
				Sound = window.androidSound;
		}else{
			storage = window.localStorage;
		}
	}else{
		storage = window.localStorage;
		Engine.pc = true;
	}
	/* Language */
	DEBUG_MODE = Functions.getDebugMode();
}

/*
	Class: frameHelper
	Helper to run frame-engine
*/
function frameHelper(val){
	this.elem = null;
	this.lastDisplay = "block";
	switch (typeof(val)){
		case 'string':
			this.elem = document.getElementById(val);
			if (elem == undefined){
				elem = document.getElementsByTagName(val)[0];
				if (elem == undefined){
					console.error("Unable to find : " + val);
				}
			}
		break;
		case 'object':
			this.elem = val;
			break;
		case 'function':
			this.elem = val;
		break;
	}
	/* Events */
	this.keydown = function(callback){ 
		this.elem.onkeydown = callback; 
	};
	this.keyup = function(callback){ 
		this.elem.onkeyup = callback; 
	};
	this.resize = function(callback){ 
		this.elem.onresize = callback; 
	};
	this.click = function(callback){ 
		this.elem.onclick = callback; 
	};
	this.beforeunload = function(callback){
		this.elem.onbeforeunload = callback;
	}
	
	this.load = function(callback) {
		if (this.elem == window){
			if (window.addEventListener) {
				window.addEventListener("load", callback, false);
			} else if (document.addEventListener) {
				document.addEventListener("load", callback, false);
			} else if (window.attachEvent) {
				window.attachEvent("onload", callback);
			} else if (typeof window.onload != "function") {
				window.onload = callback;
			} else {
				var oldonload = window.onload;
				window.onload = function() {
				  oldonload();
				  callback();
				};
			}
		}else{
			if (typeof this.elem.onload == 'function'){
				var oldfunction = this.elem.onload;
				this.elem.onload = function(e){
					oldfunction(e);
					callback(e);
				}
			}else{
				this.elem.onload = function(e){
					callback(e);
				}
			}
		}
	};
	
	this.attr = function(key,val){
		this.elem[key] = val;
	};
	
	this.val = function(val){
		if (val){
			try{
				this.elem.innerHTML = val;
			}catch(e){
				this.elem.setAttribute('value', val);
			}
		}else{
			try{
				return this.elem.innerHTML ;
			}catch(e){
				return this.elem.value;
			}
		}
	};
	
	this.offset = function(){
		var curleft = curtop = 0;
		var obj = this.elem;
		if (obj.offsetParent) {
			do {
				curleft += obj.offsetLeft;
				curtop += obj.offsetTop;
			} while (obj = obj.offsetParent);
			return [curleft,curtop];
		}
	};
	
	/* css */
	this.show = function(){	this.css('display',this.lastDisplay); };
	this.hide = function(){
		this.lastDisplay = this.css('display'); 
		this.css('display','none'); 
	};
	this.css = function(key,val){
		if (val == undefined){
			if (this.elem.style.key != undefined)
				return this.elem.style.key
			else if (this.elem.style[key] != undefined)
				return this.elem.style[key];
			else if (document.defaultView.getComputedStyle(this.elem, "").getPropertyValue("position") != undefined)
				return document.defaultView.getComputedStyle(document.getElementById("canvas"), "").getPropertyValue("position");
		}else{
			this.elem.style[key] = val;
			return this;
		}
	};
	/* Others */
	this.width = function(val){
		if (val != undefined){
			this.css('width',val);
		}else{
			if (this.elem.innerWidth)
				return this.elem.innerWidth;
			return this.elem.offsetWidth; 
		}
	};
	this.height = function(val){ 
		if (val != undefined){
			this.css('height',val);
		}else{
			if (this.elem.innerHeight)
				return this.elem.innerHeight;
			return this.elem.offsetHeight;	
		}
	};
	
	this.success = null;
	this.currentScript = null;
	
	/* Ajax JSONP call */
	this.getJSON = function(url, data, callback){
		var src = url;
		var newScript = document.createElement("script");
		var params = [];
		var param_name = ""
		var r = millis();
		newScript['id'] = 's'+r;
		
		window['success' + r] = function(params){
			var c = callback;
			var name = 'success' + r;
			var id = r;
			if (c)
				c(params);
			delete window[name];
			document.getElementsByTagName("head")[0].removeChild(document.getElementById('s' + id));
		}
			
		data["callback"] = "window.success" + r;
		
		src += (url.indexOf("?") >= 0)?"" : "?";
		
		for(param_name in data){
		  params.push(param_name + "=" + encodeURIComponent(data[param_name]));
		}
		src += params.join("&")
		
		
		newScript.type = "text/javascript";
		newScript.src = src;
		
		if(this.currentScript) document.getElementsByTagName("head")[0].removeChild(currentScript);
		document.getElementsByTagName("head")[0].appendChild(newScript);
	};	
	
	return this;
}

var canPlayMP3 = (document.createElement('audio').canPlayType('audio/mp3') != "");