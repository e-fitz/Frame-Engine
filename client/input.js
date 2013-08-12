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

	Class: Input
	Make a link with the different input devices take in charge
*/
function Input(){}
Input.instanceName = "Input";
Input.visible = true;
Input.cursor;
Input.offsetX = 0, offsetY = 0;
/*
	Variable: Input.keysUp
	Array
*/
Input.keysUp = [];
/*
	Variable: Input.keysDown
	Array
*/
Input.keysDown = [];
Input.afterRender = null;
Input.focusedElement = null;
Input.keyboard = null;
Input.lastKey = 0;
	
/* iPhone only : contains a smoothed acceleration value representing a direction given by the user */
Input.acceleration = new Vector(); 

/*
	Function: setCursorImage
	Change display image for the cursor
	
	Parameters:
	d - drawable
*/
Input.setCursorImage = function(d){
	frameHelper('canvas').css('cursor','none');
	this.cursor = d;
	Engine.setAlwaysRefresh(true);
}

/*	
	Function: setCursor
	Set cursor to a css cursor value
	
	Parameters:
	cssCursor - css value
*/
Input.setCursor = function (cssCursor){
	frameHelper('canvas').css('cursor',cssCursor);
}

/*
	Function: getCursor
	
	Return current css cursor
*/
Input.getCursor = function(){
	return frameHelper('canvas').css('cursor');
}


/*
	Function: restoreDefaultCursor
	Restore cursor to standard css cursor
*/
Input.restoreDefaultCursor = function (){
	frameHelper('canvas').css('cursor','default');
}

/*
	Function: hideCursor
	Hide cursor
*/
Input.hideCursor = function (){
	frameHelper('canvas').css('cursor','none');
	this.visible = false;
}

/*
	Function: showCursor
	Show cursor
*/
Input.showCursor = function (){
	frameHelper('canvas').css('cursor','default');
	this.visible = true;
}

/*
	Function: displayCursor
	Display current Drawable set for the cursor
*/
Input.displayCursor = function (){
	if (!this.visible || this.cursor == null || !this.cursor.isReady()) return;
	if (this.offsetX == 0 || this.offsetY == 0){
		this.offsetX = this.cursor.width >>> 1;
		this.offsetY = this.cursor.height >>> 1;
	}
	var ec = Engine.context;
	ec.save();
	var w = window;
	ec.translate(w.mouseX - this.offsetX ,w.mouseY - this.offsetY);
	this.cursor.draw(ec);
	ec.restore();
}


/*
	
*/
Input.keyUp = function (key){
	this.keysUp[key] = true;
	this.keysDown[key] = false;
}

/*
	
	
*/
Input.keyEnd = function (key){
	this.keysUp[key] = false;
	this.keysDown[key] = false;
}

/*
	Set false value on keys for keyup
*/
Input.keyDown = function (key){
	this.keysDown[key] = true;
	this.keysUp[key] = false;
}

/*

*/
Input.setAcceleration = function (x, y , z){
	this.acceleration.x = x;
	this.acceleration.y = y;
	this.acceleration.z = z;
}

/*

*/
Input.initKeyboard = function (){
	this.keyboard = [];
	var x = 0, y = Engine.height - 220;
	for (var i = 0; i < 26; i++){
		if (i % 12 == 0){
			y += 55;
			x =  (Engine.width - 660) * 0.5;
		}
		this.keyboard.push(new SimpleButton(x, y, 50, 50, color(80,80,80,210), color(255,255,255),String.fromCharCode(i + 65).toUpperCase(), function(){
			this.keyEnd(this.lastKey);
			this.lastKey = this.curentText.charCodeAt(0);
			this.keyDown(this.lastKey);
			this.focusedElement.keyDown();
		}));
		x += 55;
	}
	for (var i = 0; i < 9; i++){
		this.keyboard.push(new SimpleButton(x, y, 50, 50, color(80,80,80,210), color(255,255,255),i + "", function(){
			this.keyEnd(this.lastKey);
			this.lastKey = this.curentText.charCodeAt(0);
			this.keyDown(this.lastKey);
			this.focusedElement.keyDown();
		}));
		x += 55;
	}
	this.keyboard.push(new SimpleButton(x, y, 50, 50, color(80,80,80,210), color(255,255,255),"<-", function(){
		this.keyEnd(this.lastKey);
		this.lastKey = KEY_BKSPACE;
		this.keyDown(this.lastKey);
		this.focusedElement.keyDown();
	}));
	
}

/*
*/
Input.showKeyboard = function (focusedElement){
	if (this.afterRender != null) return;
	if (this.keyboard == null) this.initKeyboard();
	this.focusedElement = focusedElement;
	this.afterRender = Engine.currentArea.afterRender;
	var clicktime = millis();
	for (var i = 0; i < this.keyboard.length; i++){
		this.keyboard[i].enable();
	}
	Engine.currentArea.afterRender = function(){
		this.afterRender();
		for (var i = 0; i < this.keyboard.length; i++){
			this.keyboard[i].beforeProcess();
			this.keyboard[i].draw();
			this.keyboard[i].afterProcess();
			this.keyboard[i].fireEvent();
		}
		if (millis() - clicktime > 500 && mousePressed && ( mouseX < (Engine.width - 660) * 0.5 || mouseX > Engine.width - (Engine.width - 660) * 0.5 || mouseY < Engine.height - 165)){
			Engine.currentArea.afterRender = this.afterRender;
			this.afterRender = null;
			for (var i = 0; i < this.keyboard.length; i++){
				this.keyboard[i].disable();
			}
			this.focusedElement.onBlur();
		}else{
			this.focusedElement.setFocus(true);
		}
	};		
}

/*
*/
Input.hideKeyboard = function (){
	Engine.currentArea.afterRender = this.afterRender;
	this.afterRender = null;
	for (var i = 0; i < this.keyboard.length; i++){
		this.keyboard[i].disable();
	}
}

/*
	Variable: KEY_A
*/
var KEY_A		= 65;
/*
	Variable: KEY_B
*/
var KEY_B		= 66;
 /*
	Variable: KEY_C
*/
var KEY_C		= 67;
 /*
	Variable: KEY_D
*/
var KEY_D		= 68;
 /*
	Variable: KEY_E
*/
var KEY_E		= 69;
 /*
	Variable: KEY_F
*/
var KEY_F		= 70;
 /*
	Variable: KEY_G
*/
var KEY_G		= 71;
 /*
	Variable: KEY_H
*/
var KEY_H		= 72;
 /*
	Variable: KEY_I
*/
var KEY_I		= 73;
 /*
	Variable: KEY_J
*/
var KEY_J		= 74;
 /*
	Variable: KEY_K
*/
var KEY_K		= 75;
 /*
	Variable: KEY_L
*/
var KEY_L		= 76;
 /*
	Variable: KEY_M
*/
var KEY_M		= 77;
 /*
	Variable: KEY_N
*/
var KEY_N		= 78;
 /*
	Variable: KEY_O
*/
var KEY_O		= 79;
 /*
	Variable: KEY_P
*/
var KEY_P		= 80;
 /*
	Variable:  KEY_Q
*/
var KEY_Q		= 81;
 /*
	Variable:  KEY_R
*/
var KEY_R		= 82;
 /*
	Variable:  KEY_S
*/
var KEY_S		= 83;
 /*
	Variable:  KEY_T
*/
var KEY_T		= 84;
 /*
	Variable:  KEY_U
*/
var KEY_U		= 85;
 /*
	Variable:  KEY_V
*/
var KEY_V		= 86;
 /*
	Variable:  KEY_W
*/
var KEY_W		= 87;
 /*
	Variable:  KEY_X
*/
var KEY_X		= 88;
 /*
	Variable:  KEY_Y
*/
var KEY_Y		= 89;
 /*
	Variable:  KEY_Z
*/
var KEY_Z		= 90;

/*
	Variable:  KEY_UP
*/
var KEY_UP = 38;
/*
	Variable:  KEY_DOWN
*/
var KEY_DOWN = 40;
/*
	Variable:  KEY_LEFT
*/
var KEY_LEFT = 37;
/*
	Variable:  KEY_RIGHT
*/
var KEY_RIGHT = 39;
 /*
	Variable:  KEY_SPACE
*/
var KEY_SPACE = 32;
 /*
	Variable:  KEY_DELETE
*/
var KEY_DELETE = 46;
 /*
	Variable:  KEY_BKSPACE
*/
var KEY_BKSPACE = 8;
/*
	Variable:  KEY_ESC
*/
var KEY_ESC = 27;
/*
	Variable:  KEY_RETURN
*/
var KEY_RETURN = 13;

/*
	Variable:  KEY_F1
*/ 
var KEY_F1		= 112;
 /*
	Variable:  KEY_F2
*/
var KEY_F2		= 113;
 /*
	Variable:  KEY_F3
*/
var KEY_F3		= 114;
 /*
	Variable:  KEY_F4
*/
var KEY_F4		= 115;
 /*
	Variable:  KEY_F5
*/
var KEY_F5		= 116;
 /*
	Variable:  KEY_F6
*/
var KEY_F6		= 117;
 /*
	Variable:  KEY_F7
*/
var KEY_F7		= 118;
 /*
	Variable:  KEY_F8
*/
var KEY_F8		= 119;

/* 
	Variable: KEY_SHIFT
*/
var KEY_SHIFT 	= 16;

/* 
	Variable: KEY_CAPSLK
*/
var KEY_CAPSLK 	= 20;