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


/*	
	Base.js, version 1.1a
	Copyright 2006-2010, Dean Edwards
	License: http://www.opensource.org/licenses/mit-license.php
*/

var Base = function() {
	// dummy
};

Base.extend = function(_instance, _static) { // subclass
	var extend = Base.prototype.extend;
	
	// build the prototype
	Base._prototyping = true;
	var proto = new this;
	extend.call(proto, _instance);
  proto.base = function() {
    // call this method from any other method to invoke that method's ancestor
  };
	delete Base._prototyping;
	
	// create the wrapper for the constructor function
	//var constructor = proto.constructor.valueOf(); //-dean
	var constructor = proto.constructor;
	var klass = proto.constructor = function() {
		if (!Base._prototyping) {
			if (this._constructing || this.constructor == klass) { // instantiation
				this._constructing = true;
				constructor.apply(this, arguments);
				delete this._constructing;
			} else if (arguments[0] != null) { // casting
				return (arguments[0].extend || extend).call(arguments[0], proto);
			}
		}
	};
	
	// build the class interface
	klass.ancestor = this;
	klass.extend = this.extend;
	klass.forEach = this.forEach;
	klass.implement = this.implement;
	klass.prototype = proto;
	klass.toString = this.toString;
	klass.valueOf = function(type) {
		//return (type == "object") ? klass : constructor; //-dean
		return (type == "object") ? klass : constructor.valueOf();
	};
	extend.call(klass, _static);
	// class initialisation
	if (typeof klass.init == "function") klass.init();
	return klass;
};

Base.prototype = {	
	extend: function(source, value) {
		if (arguments.length > 1) { // extending with a name/value pair
			var ancestor = this[source];
			if (ancestor && (typeof value == "function") && // overriding a method?
				// the valueOf() comparison is to avoid circular references
				(!ancestor.valueOf || ancestor.valueOf() != value.valueOf()) &&
				/\bbase\b/.test(value)) {
				// get the underlying method
				var method = value.valueOf();
				// override
				value = function() {
					var previous = this.base || Base.prototype.base;
					this.base = ancestor;
					var returnValue = method.apply(this, arguments);
					this.base = previous;
					return returnValue;
				};
				// point to the underlying method
				value.valueOf = function(type) {
					return (type == "object") ? value : method;
				};
				value.toString = Base.toString;
			}
			this[source] = value;
		} else if (source) { // extending with an object literal
			var extend = Base.prototype.extend;
			// if this object has a customised extend method then use it
			if (!Base._prototyping && typeof this != "function") {
				extend = this.extend || extend;
			}
			var proto = {toSource: null};
			// do the "toString" and other methods manually
			var hidden = ["constructor", "toString", "valueOf"];
			// if we are prototyping then include the constructor
			var i = Base._prototyping ? 0 : 1;
			while (key = hidden[i++]) {
				if (source[key] != proto[key]) {
					extend.call(this, key, source[key]);

				}
			}
			// copy each of the source object's properties to this object
			for (var key in source) {
				if (!proto[key]) extend.call(this, key, source[key]);
			}
		}
		return this;
	}
};

// initialise
Base = Base.extend({
	constructor: function() {
		this.extend(arguments[0]);
	}
}, {
	ancestor: Object,
	version: "1.1",
	
	forEach: function(object, block, context) {
		for (var key in object) {
			if (this.prototype[key] === undefined) {
				block.call(context, object[key], key, object);
			}
		}
	},
		
	implement: function() {
		for (var i = 0; i < arguments.length; i++) {
			if (typeof arguments[i] == "function") {
				// if it's a function, call it
				arguments[i](this.prototype);
			} else {
				// add the interface using the extend method
				this.prototype.extend(arguments[i]);
			}
		}
		return this;
	},
	
	toString: function() {
		return String(this.valueOf());
	}
});

/*
	Class: Containers
*/
/*
	Class: IncreasingArray
	It's a container like an ArrayList but object intances are not supposed to be removed but "disabled" and next "re-enabled"
	
	It's usefull in situation like monsters popping dieing and popping again
*/
var IncreasingArray = Base.extend({
	instanceName : "IncreasingArray",
	
	/*
		Constructor: IncreasingArray
		Parameters:
		instanciate - functor
		enable - functor
		disable - functor
		check - functor
	*/
	constructor : function(instanciate, enable, disable, check){
		this.elements = [];
		this.disabled = [];
		this._instanciate = instanciate;
		if (enable != undefined){
			this._enable = enable;
			this._disable = disable;
			this._check = check;
		}else{
			this._enable = null;
			this._disable = null;
			this._check = null;
		}
	},

	/*
		Function: get
		Return an instance directly usable, this instance is provided with linked container mechanism for enable and disable it
		( Enable a disabled instance and return it or 
		if no disabled instance exit instanciate a new instance and return it )
	*/
	get : function(){
		if(arguments.length == 1) return this.get$1(arguments[0]);
		
		if (this.disabled.length == 0){
			var tmp = this._instanciate();
			tmp._container = this;
			tmp._enable = tmp.enable;
			tmp._disable = tmp.disable;
			tmp._remove = tmp.remove;
			tmp.enable = function(){ this._container.enable(this);}
			tmp.disable = function(){ this._container.disable(this);}
			tmp.remove = function(){ this._container.disable(this); this._remove()}
			this.elements.push(tmp);
			return tmp;
		}else{
			var tmp = this.disabled.pop();
			BaseElement.reset(tmp);
			if (this._enable != null) 	this._enable.apply(tmp);
			else tmp._enable();
			this.elements.push(tmp);
			return tmp;
		}
	},
	
	/*
		Function: add
		Force adding new instance object, to call at initialisation
	*/
	add : function(){
		this.get();
	},
	
	/*
		Return the specified instance
	*/
	get$1 : function(i){
		return this.elements[i];
	},
	
	/*
		Function: findNearest
		Assume all element contained by the conainers own x and y member
		
		Parameters:
		x - x pos
		y - y pos
		acceptable - a optional functor taking in arguement an element and returning true if the element is acceptable
	*/
	findNearest : function(x,y, acceptable){
		var dist = 999999999999, tmp = 0;
		var nearest;
		if (acceptable == undefined) acceptable = function(){return true;};
		if (this.elements.length == 0)
			return null;
		
		
		if (this.elements.length == 1 ){
			if(acceptable.call(this.elements[0])){
				return this.elements[0];
			}else {
				return null;
			}
		}
		
		var i = this.elements.length;
		do {
			if (!this.elements[--i].enabled) continue;
			if(!acceptable.call(this.elements[i])) continue;
			tmp = Functions.fastDistance(this.elements[i].x, this.elements[i].y, x, y);
			if (tmp < dist){
				dist = tmp;
				nearest = this.elements[i];
			}
		}while(i);
		return nearest;
	},
	
	/*
		Function: enable
		Enable an instance stored if o is an int it's used like an index
		
		Parameters:
		o - element
	*/
	enable : function(o){
		if (typeof(o) != 'number'){
			o = this.disabled.indexOf(o);
		}
		if (o < 0) return;
		if (this._enable != null) 	this._enable.apply(this.elements[o]);
		else this.elements[o]._enable();
		this.elements.push(this.elements[o]);
		this.disabled.remove(o);
	},
		
	/*
		Function: disable
		Disable an instance stored if o is an int it's considered like an index
		
		Parameters:
		o - element
	*/	
	disable : function( o){
		if (typeof(o) != 'number'){
			o = this.elements.indexOf(o);
		}
		if (o < 0) return;
		if (this.isEnabled(o)){
			if (this._disable != null)	this._disable.apply(this.elements[o]);
			else this.elements[o]._disable();
			this.disabled.push(this.elements[o]);
			this.elements.remove(o);
		}
	},

	
	/*
		Function: isEnabled
		Return true if the instance o is enabled if o is an int it's used as an index
		
		Parameters:
		o - element
	*/
	isEnabled : function(o){
		if (typeof(o) != 'number'){
			o = this.elements.indexOf(o);
		}
		if (o < 0) return false;
		if (this._check != null)
			return this._check.apply(this.elements[o]);
		else
			return this.elements[o].enabled;
	
		return false;
	},
	
	/*
		Function: remove
		
		Parameters:
		i - index
	*/
	remove : function(i){
		this.disable(i);
	},
	
	/*
		Function: reset
		Disable all object stored
	*/
	reset : function(){
		var i = this.elements.length;
		if (i == 0) return;
		do{
			this.disable(--i);
		}while(i);
	},
	
	/*
		Function : enableAll
	*/
	enableAll : function(){
		var i = this.disabled.length;
		if (i == 0) return;
		do{
			return this.enable(this.disabled[--i]);
		}while(i);
	},
	
	/*
		Function: clear
		Remove all data stored
	*/
	clear : function(){
		var tmp = this.elements.pop();
		while(tmp){
			if (tmp.destruct)
				tmp.destruct();
			delete tmp;
			tmp = this.elements.pop();
		}
		this.disabled = [];
		while(tmp){
			if (tmp.destruct)
				tmp.destruct();
			delete tmp;
			tmp = this.elements.disabled();
		}
		this.disabled = [];
	},
	
	/*
		Function: size
		Return the enabled element stored count
	*/
	size : function(){
		return this.elements.length;
	},
	
	/*
		Function: containsDisabled
		Return true if the container instance contains one or more disabled elements
	*/
	containsDisabled : function(){
		return this.disabled.length > 0;
	},
	
	/*
		Function: disabledCount
		Return the number of stored element currently disabled
	*/
	disabledCount : function(){
		return this.disabled.length;
	},
	
	/*
		Function: total
		Return the total count of element instanciated, use size() if you want loop on the container
	*/
	total : function(){
		return this.elements.length + this.disabled.length;
	}
});

/*
	Class: ArrayList
*/
var ArrayList = Base.extend({
	
	/*	
		Constructor: ArrayList
	*/
	constructor : function(){
		this.a = [];
		this.keys = [];
	},
	
	/*	Function: size
	*/
	size : function(){
		return this.keys.length;
	},
	
	/*
		Function: get
		Parameters:
		i - index
	*/
	get : function(i){
		return this.a[i];
	},
	
	/*
		Function: contains
		Parameters: 
		i - index
	*/
	contains : function(i){
		return (this.a.indexOf(i) != -1);
	},
	
	/*
		Function: add
		Parameters:
		x - element to push
		y - element to splice at position x
	*/
	add : function(){
		if (arguments.length == 1)
			this.a.push(arguments[0]);
		else if (arguments.length == 2){
			this.a.splice(arguments[0],0,arguments[1]);
		}
		this.keys.push(0);
	},
	
	/*
		Function: indexOf
		Return index of an element
		Parameters:
		elem - element
	*/
	indexOf : function(elem){
		return this.a.indexOf(elem);
	},
	
	/*
		Function: remove
		Parameters: 
		i - index
	*/
	remove : function(i){
		this.keys.pop();
		return this.a.remove(i);
	},
	
	/*
		Function: clear
		Remove all elements
	*/
	clear : function(){
		var tmp = this.a.pop();
		while(tmp){
			delete tmp;
			tmp = this.a.pop();
		}
		tmp = this.keys.pop();
		while(tmp){
			delete tmp;
			tmp = this.tmp.pop();
		}
		this.a = [];
		this.tmp = [];
	}
});

/*
	Class: Vector
*/
var Vector = Base.extend({
	
	/*
		Constructor: Vector
		Parameters:
		x - optional
		y - optional
		z - optional
	*/
	constructor : function(){
		if (arguments[0])
			this.x = arguments[0];
		else 
			this.x = 0;
		if (arguments[1])
			this.y = arguments[1];
		else
			this.y = 0;
		if (arguments[2])
			this.z = arguments[2];
		else
			this.z = 0;
	},
	
	/*
		Function: get
		Return a copy of the current vector
	*/
	get : function(){
		return new Vector(this.x,this.y,this.z);
	},
	
	/*
		Function: set
		Parameters:
		x - optional
		y - optional
		z -  optional
	*/
	set : function(){
		if (arguments[0])
			this.x = arguments[0];
		if (arguments[1])
			this.x = arguments[1];
		if (arguments[2])
			this.x = arguments[2];
	},
	
	/*
		Function: mag
		Return magnitude of the vector
	*/
	mag : function(){
		return Math.sqrt((this.x * this.x) + (this.y * this.y))
	},
	
	/*
		Function: normalize
		Return a copy normalized of this vector
	*/
	normalize : function(){
		var dist = this.mag();
		return new Vector(this.x / dist, this.y / dist)
	},
	
	/*
		Function: add
		Perfom vectorial addition
		
		Parameters:
		x -  x value
		y - y value
	*/
	add : function(x,y){
		this.x += x;
		this.y += y;
	},
	
	/*
		Function: mult
		Parameters: 
		coef -
	*/
	mult : function(coef){	
		this.x *= coef;
		this.y *= coef;
	}
});

/*
	Class: HashMap
*/
var HashMap = Base.extend({
	
	/*
		Constructor: HashMap
	*/
	constructor : function(){
		this.a = {};
		this.length = 0;
	},
	
	/*
		Function: put
		Parameters: 
		key - key
		val - value
	*/
	put : function(key,val){
		this.a[Function.sanitize(key)] = val;
		this.length++;
	},
	
	/*
		Function: get
		Parameters:
		key - key
	*/
	get : function(key){
		return this.a[Function.sanitize(key)];
	},
	
	/*
		Function: remove
		Parameters:
		key - key
	*/
	remove : function(key){
		var tmp = this.a[Function.sanitize(key)];
		if (tmp)
			this.length--;
		this.a[Function.sanitize(key)] = undefined
		return tmp;
	}
});



/*
	Class: Array
*/
/*
	Function: remove
	Append remove function to array
	
	Parameters:
	i - if i is an integer it is used as an index
*/
Array.prototype.remove = function( i ){
	if(DEBUG_MODE) var tmpi = i;
	if (typeof( i ) != 'number'){
		i = this.indexOf( i );
		for (var j = 0; j < this.length; j++){
			if (this[j] === i){
				i = this[j];
				break;
			}
		}
	}
	if (i < 0 || typeof( i ) != 'number'){
		if(DEBUG_MODE){
			console.warn("Unable to remove element ", tmpi);
		}
		return null;
	}
	var tmp = this;
	for (var pos = i, length = this.length - 1; pos < length; pos++) {
		this[pos] = this[pos + 1];
	}
	this.length = length;
	return tmp;
}

/*
	Function: noise
	Apply noise on a value
	
	Parameters:
	val - value to noised
*/
var noise = function (val) {
	var xin = val;
	var yin = val * 2;
	var n0, n1, n2;
	var s = (xin+yin)*noise.F2;
	var i = floor(xin+s);
	var j = floor(yin+s);
	var t = (i+j)*noise.G2;
	var X0 = i-t;
	var Y0 = j-t;
	var x0 = xin-X0;
	var y0 = yin-Y0;
	var i1, j1;
	if(x0>y0) {i1=1; j1=0;}
	else {i1=0; j1=1;}
	var x1 = x0 - i1 + noise.G2;
	var y1 = y0 - j1 + noise.G2;
	var x2 = x0 - 1.0 + 2.0 * noise.G2;
	var y2 = y0 - 1.0 + 2.0 * noise.G2;
	var ii = i & 255;
	var jj = j & 255;
	var gi0 = noise.permMod12[ii+noise.perm[jj]];
	var gi1 = noise.permMod12[ii+i1+noise.perm[jj+j1]];
	var gi2 = noise.permMod12[ii+1+noise.perm[jj+1]];
	var t0 = 0.5 - x0*x0-y0*y0;
	if(t0<0) n0 = 0.0;
	else {
		t0 *= t0;
		n0 = t0 * t0 * noise.dot(noise.grad3[gi0], x0, y0);
	}
	var t1 = 0.5 - x1*x1-y1*y1;
	if(t1<0) n1 = 0.0;
	else {
		t1 *= t1;
		n1 = t1 * t1 * noise.dot(noise.grad3[gi1], x1, y1);
	}
	var t2 = 0.5 - x2*x2-y2*y2;
	if(t2<0) n2 = 0.0;
	else {
		t2 *= t2;
		n2 = t2 * t2 * noise.dot(noise.grad3[gi2], x2, y2);
	}
	return 70.0 * (n0 + n1 + n2);
}

noise.perm = [];
noise.permMod12 = [];
noise.F2 = 0.366025404;
noise.G2 = 0.211324865;
noise.grad3 = [new Vector(1,1),new Vector(-1,1),new Vector(1,-1),new Vector(-1,-1),
					new Vector(1,0),new Vector(-1,0),new Vector(1,0),new Vector(-1,0),
					new Vector(0,1),new Vector(0,-1),new Vector(0,1),new Vector(0,-1)];
noise.dot = function(g, x, y) {
	return g.x*x + g.y*y; 
}
var p = [151,160,137,91,90,15,
	131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
for(var i=0; i<512; i++) {
	noise.perm[i]=p[i & 255];
	noise.permMod12[i] = (noise.perm[i] % 12);
}
delete p;

/*
	Function: red
	*global*
	
	Return red value from an int color
	
	Parameters:
	intColor - int color
*/
function red(intColor){
	return ((intColor >> 16) & 255) / 255;
}

/*
	Function: green
	*global*
	
	Return green value from an int color
	
	Parameters:
	intColor - int color
*/
function green(intColor){
	return ((intColor >> 8) & 255) / 255;
}

/*
	Function: blue
	*global*
	
	Return blue value from an int color
	
	Parameters:
	intColor - int color
*/
function blue(intColor){
	return (intColor & 255) / 255;
}

/*
	Function: intColor
	*global*
	
	Return an int representation of an rgba color
	
	Parameters:
	r - red
	g - green
	b - blue
	a - alpha
*/
function intColor(r,g,b,a){
	if (a == undefined) a = 255;
	if (r > 255) r = 255;
	if (g > 255) g = 255;
	if (b > 255) b = 255;
	return (a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255) >>> 0;
}

/*
	Class: color
	*global*
	
	Return a color object containing r, g, b, a, members and toString, hexval functions
	
	Parameters:
	r - red
	g - green
	b - blue
	a - alpha
*/
function color(r,g,b,a){
	if (r > 255) r = 255;
	if (g > 255) g = 255;
	if (b > 255) b = 255;
	return {
		'r' : r,
		'g' : g,
		'b' : b,
		'a' : a,
		toString : function(){
			if (a == undefined){
				return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
			}else{
				return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
			}
		},
		hexval : (a == undefined)?'rgb(' + r + ',' + g + ',' +  b + ')':'rgba(' +  r + ',' +  g + ',' +  b + ',' +   a + ')'
	};
}

/*
	Function: hexToColor
	*global*
	
	Return a color from an hexadecimal representation rrggbb (i.e. ffbdaf)
	
	Parameters:
	hex - hexadecimal string val
	alpha - optional, alpha channel
*/
function hexToColor(hex,alpha){
	var h=hex.replace('#', '');
	h =  h.match(new RegExp('(.{'+h.length/3+'})', 'g'));
	for(var i=0; i<h.length; i++)
		h[i] = parseInt(h[i].length==1? h[i]+h[i]:h[i], 16);

    if (typeof alpha == 'undefined')  alpha = 1;

	return color(h[0], h[1], h[2], alpha);
}

/*
	Function: fill
	*global*
	
	Change current fill color
	
	Parameters:
	c - color
	context - a context where to draw
*/

/*
	Function: fill
	*global*
	
	Change current fill color
	
	Parameters:
	r - red
	g - green
	b - blue
	a - between 0 and 1, if a > 1 then a / 255
	ec - context where to draw
*/
function fill(r,g,b, a, ec){
	if(typeof(r) == 'object'){
		if (fill.mnemonic[r]) {
			if (g){
				g.fillStyle = fill.mnemonic[r];
			}else{
				Engine.context.fillStyle = fill.mnemonic[r];
			}
		}else{
			fill.mnemonic[r] = r.hexval;
			if (g){
				g.fillStyle = fill.mnemonic[r];
			}else{
				Engine.context.fillStyle = fill.mnemonic[r];
			}
		}
	}else{
		if (a){
			if (a > 1) a *= fill.da;		
			if (a < 0) a = 0;
		}else
			a = 1
		tmp = intColor(r,g,b,a * 255);
		if (fill.mnemonic[tmp]) {
			if (ec){
				ec.fillStyle = fill.mnemonic[tmp];
			}else{
				Engine.context.fillStyle = fill.mnemonic[tmp];
			}
		}else{
			fill.mnemonic[tmp] = color(r,g,b,a).hexval;
			if (ec){
				ec.fillStyle = fill.mnemonic[tmp];
			}else{
				Engine.context.fillStyle = fill.mnemonic[tmp];
			}
		}
	}
	Engine.fill = true;
}
fill.mnemonic = [];
fill.da = 1 / 255;

/*
	Function: noFill
	*global*
	
	Disable filling style
*/
function noFill(){
	Engine.fill = false;
}

/*
	Function: fillGradient
	*global*
	
	Enable gradient filling
	
	Parameters:
	gradient - gradient made with makeGradient
	context - context where to draw
*/
function fillGradient(gradient, c){
	if (c){
		c.fillStyle = gradient;
	}else{
		Engine.context.fillStyle = gradient;
	}
}

/*
	Function: makeGradient
	*global*
	
	Create a linear gradient
	
	Parameters:
	gradientParams -
	
	{ 
	
	startX : x, startY : y, endX : x, endY : y,
	
	colors : [
	
	{ 	col : color(r,g,b),
	
	stopPos : 0.x

	},{ 	col : color(r,g,b),

	stopPos : 0.x

	}]}
*/
function makeGradient(gradientParams){
	var gradient = Engine.context.createLinearGradient(gradientParams.startX,gradientParams.startY,gradientParams.endX,gradientParams.endY);
	for (var i = 0; i < gradientParams.colors.length; i++){
		gradient.addColorStop(gradientParams.colors[i].stopPos,gradientParams.colors[i].col.toString());
	}
	return gradient;
}

/*
	Function: noStroke
	*global*
	
	Disable stroke color
*/
function noStroke(){
	Engine.stroke = false;
}

/*
	Function: stroke
	*global*
	
	Enable stroke color
	
	Parameters:
	c - color
	context - context where to draw
*/

/*
	Function: stroke
	*global*
	
	Enable stroke color
	
	Parameters:
	r - red
	g - green
	b - blue
	a - between 0 and 1, if a > 1 then a / 255
*/
function stroke(r,g,b,a){
	if (typeof(r) == 'object'){
		Engine.stroke = true;
		if (g){
			g.strokeStyle = r.hexval;
		}else{
			Engine.context.strokeStyle = r.hexval;
		}
	}else{
		if (!a) a = 255;
		Engine.stroke = true;
		Engine.context.strokeStyle = color(r,g,b,a).hexval;
	}
}

/*
	Function: stroke
	*global*
	
	Enable stroke color
	
	Parameters:
	c - color
*/



/*
	Function:  rect
	*global*
	
	Draw a rectangle
	
	Parameters:
	x - x pos
	y - y pos
	w - width of the rectangle
	h - height of the rectangle
	corner0 - optional
	corner1 - optional
	corner2 - optional
	corner3 - optional
	context - context where to draw
*/
function rect(x,y,w,h, corner0,corner1,corner2,corner3, c){
	if (corner0 && !corner1){
		corner1 = corner0;
		corner2 = corner0;
		corner3 = corner0;
	}
	x = floor(x);
	y = floor(y);
	w = floor(w);
	h = floor(h);
	if (corner0 != undefined){
		corner0 = floor(corner0);
		corner1 = floor(corner1);
		corner2 = floor(corner2);
		corner3 = floor(corner3);
	}
	if (corner0 != undefined && (corner0 != 0 || corner1 != 0 || corner2 != 0 || corner3 != 0)){
		if (c) 
			var ec = c;
		else
			var ec = Engine.context;
		var xw = x + w;
		var yh = y + h;
		var x0 = x + corner0;
		ec.beginPath();
		ec.moveTo(x0, y);
		ec.lineTo(xw - corner1, y);
		ec.quadraticCurveTo(xw, y, xw, y + corner1);
		ec.lineTo(x + w, yh - corner2);
		ec.quadraticCurveTo(xw, yh, xw - corner2, yh);
		ec.lineTo(x + corner3, yh);
		ec.quadraticCurveTo(x, yh, x, yh - corner3);
		ec.lineTo(x, y + corner0);
		ec.quadraticCurveTo(x, y, x0, y);
		ec.closePath();
		if (Engine.fill){
			ec.fill();
		}
		if (Engine.stroke) {
			ec.stroke();
		}
	}else{
		if (Engine.fill){	
			if (c)
				c.fillRect(x,y,w,h);
			else
				Engine.context.fillRect(x,y,w,h);
		}
		if (Engine.stroke) {
			if (c)
				c.strokeRect(x,y,w,h);
			else
				Engine.context.strokeRect(x,y,w,h);
		}
	}
}

/*
	Function: line
	*global*
	
	Draw a line
	
	Parameters:
	x1 - x of x1 point
	y1 - y of y1 point
	x2 - x2
	y2 - y2
	ec - optional : context where to draw 
*/
function line(x1,y1,x2,y2, ec){
	var ec = Engine.context;
	ec.beginPath();
	ec.moveTo(x1,y1);
	ec.lineTo(x2,y2);
	ec.closePath();
	if (Engine.fill){
		ec.fill();
	}
	if (Engine.stroke) {
		ec.stroke();
	}
}

/*
	Function: lineWidth
	*global*
	
	Change line width, affect line, stroke...
	
	Parameters:
	w - width
	c - optional : context where to apply
*/
function lineWidth(w, c){
	if (c){
		c.lineWidth = w;
	}else{
		Engine.context.lineWidth = w;
	}
}

/*
	Function: dashedLine
	*global*
	
	Draw a dashedLine
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
	dashArray - optional array
	c - optional : context where to draw
*/
function dashedLine(x1,y1,x2,y2, dashArray, c){
	if (c)
		var ec = c;
	else
		var ec = Engine.context;

    if(!dashArray) dashArray=[10,5]; 
    var dashCount = dashArray.length; 
    var dx = (x2 - x1); 
    var dy = (y2 - y1); 
    var xSlope = (Math.abs(dx) > Math.abs(dy)); 
    var slope = (xSlope) ? dy / dx : dx / dy; 
	ec.beginPath();
    ec.moveTo(x1, y1); 
    var distRemaining = Math.sqrt(dx * dx + dy * dy); 
    var dashIndex = 0; 
    while(distRemaining >= 0.1){ 
        var dashLength = Math.min(distRemaining, dashArray[dashIndex % dashCount]); 
        var step = Math.sqrt(dashLength * dashLength / (1 + slope * slope)); 
        if(xSlope){ 
            if(dx < 0) step = -step; 
            x1 += step 
            y1 += slope * step; 
        }else{ 
            if(dy < 0) step = -step; 
            x1 += slope * step; 
            y1 += step; 
        } 
		if(dashIndex % 2 == 0)
			ec.lineTo(x1, y1);
		else
			ec.moveTo(x1, y1); 
        distRemaining -= dashLength; 
        dashIndex++; 
    } 
	ec.closePath();
	if (Engine.fill){
		ec.fill();
	}
	if (Engine.stroke) {
		ec.stroke();
	}
}

/*
	Function: ellipse
	*global*
	
	Draw an ellipse
	
	Parameters:
	x - x
	y - y
	radius - radius
	c - optional : context where to draw
*/
function ellipse(x,y,radius, c){
	x = floor(x);
	y = floor(y);
	radius = floor(radius);
	if (c)
		var ec = c;
	else
		var ec = Engine.context;
	ec.beginPath();
	ec.arc(x, y, radius, 0, Math.PI * 2, true);
	if (Engine.fill){
		ec.fill();
	}
	if (Engine.stroke){
		ec.stroke();
	}
	ec.closePath();
}

/*
	Function: image
	*global*
	
	Draw an image
	
	Parameters:
	im - image to draw
	sx - source x
	sy - source y
	sw - source width
	sh - source height
	dx - destination x
	dy - destination y
	dw - destination width
	dh - destination height
	c - optional : contexte where to draw
*/
function image(im, sx, sy, sw, sh, dx, dy, dw, dh, c){
	sx = floor(sx);
	sy = floor(sy);
	sw = floor(sw);
	sh = floor(sh);
	dx = floor(dx);
	dy = floor(dy);
	dw = floor(dw);
	dh = floor(dh);
	if (!c)
		var c = Engine.context;
	if (arguments.length == 9)
		c.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
	else if (arguments.length == 5)
		c.drawImage(im, sx, sy, sw, sh);
	else if (arguments.length == 3)
		c.drawImage(im, sx, sy);
}

/*
	Function: text
	*global*
	
	Draw text
	
	Parameters:
	t - text
	x - x
	y - y
	c - optional : contexte where to draw
*/
function text(t,x,y, c){
	x = floor(x);
	y = floor(y);
	if (c)
		c.fillText(t,x,y);
	else
		Engine.context.fillText(t,x,y);
}

/*
	Function: textSize
	*global*
	
	Change text size
	
	Parameters:
	s - size
	c - optional : contexte where to draw
*/
function textSize(s, c){
	if (c)
		c.font = s + "px sans-serif";
	else
		Engine.context.font = s + "px sans-serif";
}

/*
	Function: textWidth
	*global*
	
	Return text width
	
	Parameters:
	t - text
*/
function textWidth(t){
	return Engine.context.measureText(t).width;
}

/*
	Function: random
	*global*
	
	Return a random value between min and max
	
	Parameters:
	min - min
	max - max
*/
function random(min,max){
	return Math.random()*(max - min + 1)+min;
}

/*
	Function: millis
	*global*
	
	Return current timestamp

*/
var millis = Date.now || function(){
	return (new Date()).getTime();
}

/*
	Function: degrees
	*global*
	
	Return degree value of a radians angle
	
	Parameters:
	val - radian angle
*/
function degrees(val){
	return val * degrees.mnemonic;
}
degrees.mnemonic = 180 / Math.PI;

/*
	Function: radians
	*global*
	
	Return radian value of a degree angle
	
	Parameters:
	val - degree angle
*/
function radians(val){
	return val * radians.mnemonic;
}
radians.mnemonic = Math.PI / 180;

/*
	Function: floor
	*global*
	
	Fast floor for positive number only
	
	Parameters:
	val - value to floor
*/
function floor(val){
	if (val > 0)
		return val | 0;
	else
		return Math.floor(val);
}

/*
	Function: setOpacity
	*global*
	
	Change drawing opacity 
	
	Parameters:
	val - between 0 to 1
	c - optional : contexte where to draw
*/
function setOpacity(val, c){
	if (val > 1) val = val * 0.01
	if (c)
		c.globalAlpha = val; 
	else
		Engine.context.globalAlpha = val; 
}

/*
	Function: getRandomColor
	*global*
	
	Return a random color
*/
getRandomColor = function(){
	return color(random(0,255),random(0,255),random(0,255));
}

/*
	Class: Timer
	Define a timer, interval set a 100ms by default
*/
var Timer = Base.extend({
	
	/*
	Constructor: Timer
	Parameters:
	interval - milliseconds 
	*/
	constructor : function(interval){
		this.interval = interval;
		this.lastTime = millis();
	},

	/*
	*	
		Function: itsTime
		Return true only if the minimum interval is elapsed
	*/
	itsTime : function(){
		if (millis() - this.lastTime > this.interval){
			this.lastTime = millis();
			return true;
		}
		return false;
	}
});

/*
	Class: TimeAlarm
	Act as a reverse chronometer
*/
var TimeAlarm = Base.extend({

	/*
		Constructor: TimeAlarm
		Parameters:
		remainingTime - time remaining 
		started - start at instanciation or not, boolean
	*/
	constructor : function(remainingTime, started){
		this.lastTime = -1;
		this.remainingTime = remainingTime;
		this.initialRemaining  = remainingTime;
		if (started){
			lastTime = millis();
		}
		this.setRemainingTime = function(remainingTime)
		{
			this.remainingTime = remainingTime;
			lastTime = -1;
		}
	},
	
	/*
		Function: getRemainingTime
		Return remaining time
	*/
	getRemainingTime : function(){
		if (this.lastTime == -1){
			this.lastTime =  millis();
		}else{
			this.remainingTime = this.remainingTime - ( millis() - this.lastTime);
			this.lastTime =  millis();
			if (this.remainingTime < 0) this.remainingTime = 0;
		}
		return this.remainingTime;
	},
	
	/*
		Function: itsTime
		Return true if timer end
	*/
	itsTime : function(){
		return (this.getRemainingTime() <= 0);
	},
	
	/*
		Function: reset
		Restart time alarm
	*/
	reset : function(){
		this.remainingTime = this.initialRemaining;
		this.lastTime = -1;
	}
	
});

/*
	Class: CheckPoint
	Define a check point, it's like a point but with atCheckPoint method
*/
var CheckPoint = Base.extend({
	constructor : function(x,y){
		this.x = x;
		this.y = y;
	},

	/*
		return true only if x2 and y2 are equal to the position of this instance
	*/
	atCheckPoint : function(x2,y2){
		return (this.x == x2 && this.y == y2);
	}
	
});

/*
	Function: randomCheckPoint
	Generate an array of "number" checkpoint between min and max
*/
CheckPoint.randomCheckPoint = function(xMin, yMin, xMax, yMax, number){
	var ck = [];

	for (var i =0; i < number; i++){
		xk[i] = new CheckPoint(
			floor(random(0,xMax-xMin)+xMin),
			floor(random(0,yMax-yMin)+yMin)
		);
	}
	return ck;
}
/*
	Get data need to load a ressource from the database
*/
function getRessource_ajax(id, callback){

	frameHelper.getJSON(
		server_url + "dataLoader.php?callback=?",
		{'method' : 'ressource','id' : id},
		function(data){callback(data, id); }
	);
}

/*
	Get data need to load an area from the database
*/
function getArea_ajax(id, callback){
	frameHelper.getJSON(
		server_url + "dataLoader.php?callback=?",
		{'method' : 'area','id' : id},
		function(data){callback(data); }
	);
}


/*
	Get data need to load a ressource from the database
*/
function sendMessage_ajax(topic,uniqueId, key, value){

	frameHelper().getJSON(
		server_url +  "network.php",
		{'method' : 'addMessage','topic' : topic, 'key':key, 'value':value, 'uniqueId':uniqueId}
	);
}

/*
	Get data need to load an area from the database
*/
function getMessages_ajax(topic,uniqueId, key, timestamp, preprocess, callback){
	frameHelper().getJSON(
		server_url + "network.php",
		{'method' : 'getMessages','topic' : topic, 'key':key,'uniqueId':uniqueId, 'timestamp':timestamp},
		function(data){
			preprocess(key, data, callback); 
		}
	);
}

/*
	Return an uniqueId for this user
*/
function getUniqueId_ajax(topic,callback){
	frameHelper().getJSON(
		server_url + "network.php",
		{'method' : 'getUniqueId','topic' : topic},
		function(data){
			callback(data);
		}
	);
}

/*
	Enter room process
*/
function enterRoom_ajax(that, topic, callback){
	frameHelper().getJSON(
		server_url + "network.php",
		{'method' : 'enterRoom','topic' : topic},
		function(data){
			callback(that,data);
		}
	);
}

/*
	Leave room process
*/
function leaveRoom_ajax(topic, uniqueId, roomInstance){
	frameHelper().getJSON(
		server_url + "network.php",
		{'method' : 'leaveRoom','topic' : topic, 'uniqueId':uniqueId,'roomInstance':roomInstance}
	);
}

function easyDataLoad_ajax(that,key, callback){
	frameHelper().getJSON(
		server_url + "easyData.php",
		{'method' : 'load','key' : key},
		function(data){
			callback.call(that,data);
		}
	);
}

function easyDataSave_ajax(that, key, value, callback){
	frameHelper().getJSON(
		server_url + "easyData.php",
		{'method' : 'save','key' : key, 'value':value},
		function(data){
			callback.call(that,data);
		}
	);
}

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
		var r = (Math.random() + "").replace('.','');
		
		if (DEBUG_MODE){
			window['success' + r] = function(data){
				console.log("call : " + src);
				console.log(data);
				callback(data);
			}
		}else
			window['success' + r] = callback;
			
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
/*
	Class: Input
	Make a link with the different input devices take in charge
*/
function Input(){}
Input.instanceName = "Input";
Input.visible = true;
Input.cursor;
Input.offsetX = 0, offsetY = 0;
Input.keysUp = [];
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
	this.cursor.draw();
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



/*
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
	effet - Engine.FADE_OUT
*/
Engine.changeArea = function(a, effect){
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
	Engine.changeEffect = effect;
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
		if (e.changeEffect == Engine.NONE){
			eca.reset();
			Engine.currentArea = e.newArea;
			e.newArea = null;
			e.changeEffect = Engine.NOCHANGE;
		}
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
			tmp.onMouseDown();
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
			tmp.onMouseUp();
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
		if (BaseElement.isOver(tmp)){
			if(!tmp.focused){
				tmp.focused = true;
				tmp.onFocus();
			} 
			return;
		}else if (tmp.focused){
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
Engine.NOCHANGE = 0;
Engine.NONE = 1;
Engine.FADE_OUT = 2;
Engine.FADE_IN = 3;
Engine.currentArea = null;
Engine.newArea = null; 
Engine.step = 0;
Engine.changeEffect = Engine.NOCHANGE;
Engine.bgColor = {};
Engine.alwaysRefresh = true;
Engine.room = null;
Engine.timerInfo = null;
Engine.info = null;
Engine.resizeRatio = 1;
Engine.paused = false;
Engine.buttonPressed = false;
Engine.stroke = false;
Engine.fill = true;
Engine.prototype.constructor = Engine;
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
		engine.dispatchFocusEvents();
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
		engine.dispatchFocusEvents();
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

/*
	Class: Functions
	Usefull static functions
*/
function Functions(){
	this.instanceName = "Functions";
	/*
		Return true if a function is declared into an object
	*/
}

/*
	Function: getDebugMode
	*static*
	
	Return true if the debug mode is enabled
*/
Functions.getDebugMode = function(){
	return DEBUG_MODE;
}

/*
	Function: functionExists
	*static*
	
	Return true if a function exist within an object
	
	Parameters:
	yourFunctionName - function name
	obj - obj containing (or not) the function
*/
Functions.functionExists = function(yourFunctionName, obj){
	return (yourFunctionName in obj);
}

/*
	Function: getObjectClass
	*static*
	
	Return the class name of an object
	
	Parameters:
	obj - object instance
*/
Functions.getObjectClass = function(obj) {
	if (obj && obj.constructor && obj.constructor.toString) {
		var arr = obj.constructor.toString().match(/function\s*(\w+)/);
		if (arr && arr.length == 2) {
			return arr ;
		}
	}

	return "undefined";
}
	
/*
	Function: intersect
	*static*
	
	Check if this element hit an other element, by bounding box
	
	Parameters:
	b1 - element
	b2 - element
*/
Functions.intersect = function(b1, b2){
	return ((b1.x < b2.rightBound)
	&& (b1.rightBound > b2.x)
	&& (b1.y < b2.bottomBound)
	&& (b1.bottomBound > b2.y));
}


/*
	Function: rotate
	*static*
	
	Rotate a vector by an angle
	
	Parameters:
	v - vector
	theta - angle in radian
	
	Return: return the vector v
*/
Functions.rotate = function(v, theta){
	var xTemp = v.x;
	v.x = v.x*cos(theta) - v.y*sin(theta);
	v.y = xTemp*sin(theta) + v.y*cos(theta);
	return v;
}

/*
	Function: points2Line
	*static*
	
	Return a vector reprensenting the line formed by two points
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
*/
Functions.points2Line = function(x1, y1, x2, y2){
	var a = (y2 - y1 ) / (x2 - x1);
	return new Vector(a,y1 - a * x1);
}

/*
	Function: pointInSquare
	*static*
	
	Check if a point is inside a square
	
	Parameters:
	x1 - x1 point
	y1 - y1 point
	x2 - x2 top left square corner
	y2 - y2 top left square corner
	width - square width
	height - square height
*/
Functions.pointInSquare = function(x1, y1, x2, y2, width, height){
	return (x1 >= x2 && y1 >= y2 && x1 <= x2 + width && y1 <= y2 + height);
}

/*
	Function: interset
	*static*
	
*/
Functions.intersect = function(x1, y1, x2, y2, x3, y3, x4, y4){
		var a1, a2, b1, b2, c1, c2;
		var r1, r2 , r3, r4;
		var denom, offset, num;

		/* Compute a1, b1, c1, where line joining points 1 and 2
		  is "a1 x + b1 y + c1 = 0". */
		a1 = y2 - y1;
		b1 = x1 - x2;
		c1 = (x2 * y1) - (x1 * y2);

		/* Compute r3 and r4. */
		r3 = ((a1 * x3) + (b1 * y3) + c1);
		r4 = ((a1 * x4) + (b1 * y4) + c1);

		/* Check signs of r3 and r4. If both point 3 and point 4 lie on
		 same side of line 1, the line segments do not intersect. */
		if ((r3 != 0) && (r4 != 0) && Functions.same_sign(r3, r4)){
		return null;
		}

		/* Compute a2, b2, c2 */
		a2 = y4 - y3;
		b2 = x3 - x4;
		c2 = (x4 * y3) - (x3 * y4);

		/* Compute r1 and r2 */
		r1 = (a2 * x1) + (b2 * y1) + c2;
		r2 = (a2 * x2) + (b2 * y2) + c2;

		/* Check signs of r1 and r2. If both point 1 and point 2 lie
		 on same side of second line segment, the line segments do
		 not intersect. */
		if ((r1 != 0) && (r2 != 0) && (Functions.same_sign(r1, r2))){
		return null;
		}

		/* Line segments intersect: compute intersection point. */
		denom = (a1 * b2) - (a2 * b1);

		if (denom == 0) {
		return null;
		}

		if (denom < 0){ 
	offset = -denom / 2; 
	} 
	else {
	offset = denom / 2 ;
	}

	/* The denom/2 is to get rounding instead of truncating. It
	 is added or subtracted to the numerator, depending upon the
	 sign of the numerator. */
	num = (b1 * c2) - (b2 * c1);
	if (num < 0){
	x = (num - offset) / denom;
	} 
	else {
	x = (num + offset) / denom;
	}

	num = (a2 * c1) - (a1 * c2);
	if (num < 0){
	y = ( num - offset) / denom;
	} 
	else {
	y = (num + offset) / denom;
	}

	/* lines_intersect */
	return new Functions.$p.PVector(x,y);
}

Functions.same_sign = function(a, b){
  return (( a * b) >= 0);
}

/*
	Function: distance
	*static*
	
	Return the distance between two point
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
*/
Functions.distance = function(x1, y1, x2, y2){
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

/*
	Function: fastDistance
	*static*
	
	Distance without final square root
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
*/
Functions.fastDistance = function(x1, y1, x2, y2){
	var t1 = (x1 - x2), t2 = (y1 - y2);
	return t1*t1 + t2*t2;
}

/*
	Function: polarAngle
	*static*
	
	Return the polar angle for the given vector (x,y)
	
	Parameters:
	x - x
	y - y
*/
Functions.polarAngle = function(x, y){
	if (x > 0 && y >= 0){
		return Math.atan(y/x);
	}else if (x > 0 && y < 0){
		return Math.atan(y/x) + Math.PI * 2;
	}else if (x < 0){
		return Math.atan(y / x) + Math.PI;
	}else if (x == 0 && y > 0){
		return Math.PI * 0.5;
	}else if (x == 0 && y < 0){
		return (Math.pi * 3) * 0.5;
	}
}

/*
	Function: sanitize
	*static*
	
	Sanitize a string
	
	Parameters:
	string - string to sanitize
	
	Return: sanitized string
*/
Function.sanitize = function(string){
	return string.replace(Function.sanitize.regex,'');
}
Function.sanitize.regex = /[^a-zA-Z 0-9]+/g;

Functions.prototype.constructor = Functions;
/*
	Class: Network
	Permit to exchange information between players in a topic, all player in the topic receive the messages
*/
var Network = Base.extend({

	/*
		Constructor: Network
		
		Parameters:
		topicName - name to the topic where data are transmisted
	*/
	constructor : function(topicName){
		this.instanceName = "Network";
		this.uniqueId = -1;
		this.topic = topicName;
		this.timer = new Timer(1000);
		this.lastCall = new HashMap();
		getUniqueId_ajax(this.topic, this.setUniqueId);
	},
		
	setUniqueId : function(id){
		this.uniqueId = id;
	},
	
	/*
		Function: getUniqueId
		Return the unique id of the player
	*/
	getUniqueId : function(){
		return this.uniqueId;
	},
	
	/*
		Function: setTimer
		Set the elapsed time before new message are take in
		
		Parameters:
		interval - millisecond
	*/
	setTimer : function(interval){
		this.timer = new Timer(interval);
	},
	
	/*
		Function: sendMessage
		Send information to other player connected to the topic
		
		Parameters:
		key -  key in the topic
		value - value
	*/
	sendMessage : function(key, value){
		sendMessage_ajax(this.topic, this.uniqueId,key,value);
	},
	
	/*
		Function: getMessages
		Get waiting information for the caller relative to the key 
		
		Parameters:
		key - key in the topic
		callback - callback function
	*/
	getMessages : function(key, callback){
		if (this.timer.itsTime()){
			var s = this.lastCall.get(key);
			if (s == null) s = '2012-01-01 00:00:00';
			getMessages_ajax(this.topic,this.uniqueId,key, s , this.preprocess, callback);
		}
	},
	
	/*
		Function: forceGetMessages
		Get message without waiting timer
		
		Parameters:
		key - key in the topic
		callback - callback function
	*/
	forceGetMessages : function(key, callback){
		var s = this.lastCall.get(key);
		if (s == null) s = '2012-01-01 00:00:00';
		getMessages_ajax(this.topic,this.uniqueId,key, s , this.preprocess, callback);
	},
	
	preprocess : function(key,data, callback){
		this.lastCall.put(key, data.timestamp);
		callback(data);
	},
	
	/*
		Function: itsTime
		Return true if it's time to get message
	*/
	itsTime : function(){
		return this.timer.itsTime();
	},
	
	/*
		Function: changeTopic
		Change current topic
		
		Parameters:
		topicName - new topic name
	*/
	changeTopic : function(topicName){
		this.topic = topicName;
	}
	
});


/*
	Class: Room
	Organized informations exchanged, with a max player value,
	only player on the room receive the messages
*/

var Room = Base.extend({
	state : 0,
	
	/*
		Constructor: Room
		Parameters:
		roomName - unique room name for your game
		interval - how fast data had to be retrieved
	*/
	constructor : function(roomName, interval){
		if (DEBUG_MODE){
			if (arguments.length != 2) console.error("Room not instanciated waiting 2 arguments " + arguments.length + " given.");
		}
		this.roomName = roomName;
		this.interval = interval;
		this.network = new Network(roomName);
		this.network.setTimer(interval);
		handlers = [];
	},
	
	/*
		Function: process
		Process get mesage on the current room
	*/
	process : function(){
		if (this.isReady()){
			if (!this.network.itsTime()) return;
			for (var i = this.handlers.length - 1; i >= 0; i--)
				this.network.forceGetMessages(this.handlers[i][0],this.handlers[i][1]);
		}
	},
	
	/*
		Process player entering room (autocalled by constructor)
	*/
	enterRoom_async : function(that, roomInstance){
		that.roomInstance = roomInstance;
		that.network.changeTopic(that.roomName + roomInstance);
		frameHelper(window).beforeunload(function(){ that.leaveRoom(); return EXIT_MESSAGE;});
		this.state = 2;
	},
	
	/*
		Function: isReady
		Return true if the room is ready
	*/
	isReady : function(){
		if (this.state == 2) return true;
		if (this.network.getUniqueId() >= 0 && this.state == 0){
			this.state = 1;
			enterRoom_ajax(this, this.roomName, this.enterRoom_async);
		}
		return false;
	},
	
	
	/*
		Function: sendMessage
		Send a message in the room instance occupied by the caller
		
		Parameters:
		key - key in the topic
		value - value to send
	*/
	sendMessage : function(key, value){
		if (this.isReady()){
			this.network.sendMessage(key,value);	
		}
	},
	
	/*
		Function: setMessagesHandler
		Add a function which will be called when a message is received
		
		Parameters:
		key - key in the topic
		callback - callback
	*/
	setMessagesHandler : function(key, callback){
		handlers.push([key, callback]);
	},
	
	/*
		Function: getUniqueId
		Return the unique id of the player
	*/
	getUniqueId : function(){
		return this.network.getUniqueId();
	},
	
	/*	
		Function: leaveRoom
		Leave the room
	*/
	leaveRoom : function(){
		leaveRoom_ajax(this.roomName,this.network.getUniqueId(), this.roomInstance);
	}
	
});
/*
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
/*
	Class: Area
 Permit to make an area usable in the motor
 An area is composed by multiple drawable and multiple layer
 (can be used to make a zone in your game)
*/

function Area (){
	this.instanceName = "GameArea";
	this.layerChanged = true;
	this.layers = new ArrayList();
	this.layerPos = new ArrayList();
	this.tmp = null;
	this.fullScreenImage = null;
	this.width = 0; this.height = 0;
	this.state = 0;
	/* Variable: x
		x position in pixel
	*/
	this.x = 0;
	/* Variable: y
		y position in pixel
	*/
	this.y = 0;
	this.gravity = 0;
	/*
		Variable: percentReady
		Percent of area loaded
	*/
	this.percentReady = 0;
	
	this.asScreen = false;
		
	this.physicsArray = new ArrayList();
}
Area.prototype = {
	/*
		Function: isReady
		Return true only if all data related to this area have been loaded
	*/
	isReady : function(){
		if (this.state == Area.LOADED){
			return true;
		}else {
			var tmp = null;
			this.percentReady = 0;
			for (var i = this.layers.size() - 1; i >= 0; i--){
				if (this.layers.get(i).isReady()){
					tmp = this.layers.get(i);
					if (tmp.x + tmp.width > this.width)
						this.width = tmp.x + tmp.width;
					if (tmp.y + tmp.height > this.height)
						this.height = tmp.y + tmp.height;	
					this.percentReady += 1 / this.layers.size();
				}
			}
			if (this.fullScreenImage != null && typeof(this.fullScreenImage) != 'object'){
				this.percentReady -= 0.02;
				this.fullScreenImage = Library.get(this.fullScreenPath);
			}
			if (this.percentReady + 0.01 < 1) return false;
			else this.percentReady = 1;
			this.state = Area.LOADED;
			if (Area.DEBUG_MODE){
				console.info("Current area completely loaded");
			}
		}
		return false;
	},

	/*
		Function: addDrawable
		Add a drawable element to the area in the specified simulated layer, if the element doesnt exist in the area.
		
		Parameters:
		layer - layer index.
		d - Element drawable.
	*/
	addDrawable : function(layer, d){
		if (this.layers.contains(d)) return;
		if (this.state != Area.LOADED)
			this.state = Area.LOADING;
		if (layer == 0 && this.layerPos.get(layer) == undefined){
			this.layerPos.add(layer,{"start":0,"end":0});
		}else if (this.layerPos.get(layer) == undefined ){
			if (this.layerPos.size() == 0) this.layerPos.add(0, {"start":0,"end":0});
			for (var i = 1; i <= layer; i++){
				if (this.layerPos.get(i) == undefined){
					this.layerPos.add(i,{"start":this.layerPos.get(i-1).end,"end":this.layerPos.get(i-1).end});
				}
			}
		}
		
		this.layers.add(this.layerPos.get(layer).start,d);
		this.layerPos.get(layer).end = this.layerPos.get(layer).end + 1;
		for (var i = this.layerPos.size() - 1; i > layer; i--){
				this.layerPos.get(i).start = this.layerPos.get(i).start + 1.
				this.layerPos.get(i).end = this.layerPos.get(i).end + 1;
		}
		
		if (d.keyPressHandler)
			Engine.addKeyPressHandler(d);
		if (d.clickHandler)
			Engine.addClickHandler(d);
		if (d.onMouseUp)
			Engine.addClickHandler(d);
		if (d.onMouseDown)
			Engine.addClickHandler(d);
		if (d.focusHandler)
			Engine.addFocusHandler(d);
		if (d.mouseOverHandler)
			Engine.addMouseOverHandler(d);
		
		if (d.instanceName == "PhysicEntity"){
			this.physicsArray.add(d);
		}
		
		d._area = this;
		d._zIndex = layer;
	},

	/*
		Function: setFullScreenBackground
		Put an image as full screen background
		
		Parameters:
		i - image path
	*/
	setFullScreenBackground : function(i){
		if (DEBUG_MODE)
			console.info("Setting fullscreen background");
		if (Library.get(i) == undefined)
			Library.addImage(i)
		this.fullScreenPath = i;
		this.fullScreenImage = Library.get(i);
	},
	
	/*
		Function: addDrawable
		if set at true everything outof the area will be hidden
		
		Parameters:
		value - boolean
	*/
	setAsScreen : function(value){
		this.asScreen = value;
	},
	
	/*
		Function: ready
		Force an area to be ready
		
		Parameters:
		isReady - boolean
	*/
	ready : function(isReady){
		if (isReady)
			this.state = LOADED;
		else
			this.state = LOADING;
	},
	
	/*
		
	*/
	resize : function(){
		i = this.layers.size();
		do{
			BaseElement.resize(this.layers.get(--i));
		}while(i);
	},
	
	/*
		Function:
		Set a direction where object are attracted from (this vector is always normalized)
		
		Parameters:
		x - Vector element
	*/
	setGravity : function(x){
		this.gravity = x;
	},

	/*
		Function: reset
		Reset this area
	*/
	reset : function(){
		this.layerChanged = true;
		for (var i = this.layers.size() - 1; i >= 0; i--)
			this.layers.get(i).destruct();
		delete this.layerPos;
		delete this.layers;
		this.layerPos = new ArrayList();
		this.layers = new ArrayList();
		this.tmp = null;
		this.fullScreenImage = null;
		this.width = 0;
		this.height = 0;
		this.state = 0;
		this.pos = new Vector(0,0);
		this.gravity = 0;
		this.percentReady = 0;	
		this.asScreen = false;
		this.physicsArray = new ArrayList();
	},
	
	/*
		Function: beforeRender
		MustOverride to compute before render automaticaly
	*/
	beforeRender : null,
	
	/*
		Function: afterRender
		MustOverride to compute after render automaticaly
	*/
	afterRender : null,
	
	/*
		Function: init
		MustOverride to init data automaticaly
	*/
	init : function(){},
	
	render : function(){
		var e = Engine;
		var timestamp = millis();
		var ew = Engine.width;
		var eh = Engine.height;
		var notSkipFrame = timestamp <= e.__nextRenderTime + e.__renderSpeed;
		/* Area rendering */
		if (notSkipFrame && e.alwaysRefresh){
			fill(e.bgColor.r,e.bgColor.g, e.bgColor.b);
			rect(0,0,ew,eh);
		}
		
		this.beforeRender && this.beforeRender();
		var i = 0;

		notSkipFrame && this.fullScreenImage != null && e.context.drawImage(this.fullScreenImage,0,0,ew,eh);
			
		var k  = this.physicsArray.size();
		i = k;
		var tmp = null;
		var j= 0;
		if (i > 0){
			do{
				tmp = this.physicsArray.get(--i);
				if (tmp.enabled){
					j = k;
					if (j > 0){
						do{
							i != --j && this.physicsArray.get(j).interact(tmp);
						}while(j);
					}
					if (i != 0) tmp.interact(this.physicsArray.get(0));
				}
			}while(i);
		}

		tmp = null;
		i = this.layers.size();
		var b = BaseElement;
		if (e.alwaysRefresh || this.layerChanged ){
			do{
				tmp = this.layers.get(--i);
				
				if (!tmp.enabled) continue;
				if (!tmp._ui && tmp.beforeProcess)
					tmp.beforeProcess();
				if (tmp.enabled){
					/* internal before process */
					var tpm = tmp.pathModifier;
					if (tmp.owner){
						tmp.setPos(tmp.owner.elem.x + tmp.owner.offsetX, tmp.owner.elem.y + tmp.owner.offsetY);
					}
					
					/* Compute pathmodifier */
					tpm.angle = (tpm.angle + tpm.step) % 360;
					if (tpm != b.NONE && tpm.auto){
						/* Apply path modifier in X */
						if (tpm.applyToX){
							if (tpm.type == b.CIRCLE){
								tmp.x += tpm.offsetX + tpm.radius * Math.cos(radians(tpm.angle));
							}else if (tpm.type == b.CIRCLE_Z1 || tpm.type == b.SINCURVE){
								tmp.x += tpm.offsetX + tpm.radius * Math.sin(radians(tpm.angle));
							}else if (tpm.type == b.CIRCLE_Z2){
								 tmp.x += tpm.offsetX + tpm.radius * -Math.sin(radians(tpm.angle));
							}
						}
						/* Apply path modifier in Y */
						if (tpm.applyToY){
							if (tpm.type == b.CIRCLE){
								tmp.y += tpm.offsetY + tpm.radius * Math.sin(radians(tpm.angle));
							}else if (tpm.type == b.CIRCLE_Z1 || tpm.type == b.SINCURVE){
								tmp.y += tpm.offsetY + tpm.radius * Math.sin(radians(tpm.angle));
							}else if (tpm.type == b.CIRCLE_Z2){
								tmp.y += tpm.offsetY + tpm.radius * Math.sin(radians(tpm.angle));
							}
						}
						if (tpm.type == b.HEADING){
							if (tpm.lastX && tpm.lastY)
								tmp.setRotation(Functions.polarAngle(tmp.x-tpm.lastX,tmp.y-tpm.lastY),true);
							tpm.lastX = tmp.x;
							tpm.lastY = tmp.y;
						}
					}
					/* Process stack */
					var tmp2 = tmp.changementStack.pop();
					while(tmp2){
						if (tmp2[0] == b.SETPOSX){
							if (tmp.x != tmp2[1] && !tmp.stucked){
								if ((tpm == null || tpm.type == b.NONE ) && !tpm.auto){
									tmp.x = tmp2[1];
								}else{
									if (tmp.owner){
										tmp.x = 0;
										tmp.x = b.applyPathModifierX(tmp, 0);
										tmp.x += tmp.owner.x;
									}else {
										tmp.x = b.applyPathModifierX(tmp, tmp2[1]);
									}
								}
								tmp.rightBound = tmp.x + tmp.scaledWidth;
							}
						}else if (tmp2[0] == b.SETPOSY){
							if (tmp.y != tmp2[1] && !tmp.stucked){
								if ((tpm == null || tpm.type == b.NONE ) && !tpm.auto ){
									tmp.y = tmp2[1];
								}else{
									if (tmp.owner){
										tmp.y = 0;
										tmp.y = b.applyPathModifierY(tmp, 0);
										tmp.y += tmp.owner.y;
									}else{
										tmp.y = b.applyPathModifierY(tmp, tmp2[1]);
									}
								}
								tmp.bottomBound = tmp.y + tmp.scaledHeight;
							}
						}
						tmp2 = tmp.changementStack.pop();
					}
					
					/* Animate */
					if (tmp.animationStarted){
						var j = tmp.anim.length;
						if (j){
							do{
								var tanim = tmp.anim[--j];
								if (tanim.animationType == b.FADE_IN){
									if(tmp.opacity >= 1){
										if (tanim.__callback){
											tanim.__callback.call(tmp);
										}
										tmp.anim.remove(j);
									}else{
										tmp.opacity += tanim.offset;
										tanim.offset = Engine.__renderSpeed / Math.abs(tanim.timeToReach);
									}
								}else if (tanim.animationType == b.FADE_OUT){
									if (tmp.opacity <= 0){
										if (tanim.__callback != null){
											tanim.__callback.call(tmp);
										}
										tmp.anim.remove(j);
									}else{
										tmp.opacity -= tanim.offset;
										tanim.offset = Engine.__renderSpeed / Math.abs(tanim.timeToReach);
									}
								}else if (tanim.animationType == b.GOTO){
									var p = (millis() - tanim.startTime) / tanim.timeToReach;
									if (p >= 1 || millis() > tanim.endTime){
										tmp.setPos(tanim.startX + tanim.newX, tanim.startY + tanim.newY);
										tanim.__callback && tanim.__callback.apply(tmp);
										tmp.anim.remove(j);
									}else{
										tmp.setPos(tanim.startX + tanim.newX * p, tanim.startY + tanim.newY * p);
									}
								}else if (tanim.animationType == b.SCALETO){
									if (tanim.offsetX > 0){
										tmp.scaling.x += (tanim.newX / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.scaling.x > tanim.newX) tanim.offsetX = 0;
									}else if (tanim.offsetX < 0){
										tmp.scaling.x -= (tanim.newX / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.scaling.x < tanim.newX) tanim.offsetX = 0;
									}
									if (tanim.offsetY > 0){
										tmp.scaling.y += (tanim.newY / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.scaling.y > tanim.newY) tanim.offsetY = 0;
									}else if (tanim.offsetY < 0){
										tmp.scaling.y -= (tanim.newY / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.scaling.y < tanim.newY) tanim.offsetY = 0;
									}
									if (tanim.offsetX == 0 && tanim.offsetY == 0){
										tmp.scale(tmp.scaling.x,tmp.scaling.y);
										tanim.__callback && tanim.__callback.apply(tmp);
										tmp.anim.remove(j);
									}else{
										tmp.scale(tmp.scaling.x,tmp.scaling.y);
									}
								}else if (tanim.animationType == b.SKEWTO){
									if (tanim.offsetX > 0){
										tmp.skew.x += (tanim.newX / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.skew.x > tanim.newX) tanim.offsetX = 0;
									}else if (tanim.offsetX < 0){console.log( (tanim.newX / (tanim.timeToReach / Engine.__renderSpeed)));
										tmp.skew.x += (tanim.newX / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.skew.x < tanim.newX) tanim.offsetX = 0;
									}
									if (tanim.offsetY > 0){
										tmp.skew.y += (tanim.newY / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.skew.y > tanim.newY) tanim.offsetY = 0;
									}else if (tanim.offsetY < 0){
										tmp.skew.y += (tanim.newY / (tanim.timeToReach / Engine.__renderSpeed));
										if (tmp.skew.y < tanim.newY) tanim.offsetY = 0;
									}
									if (tanim.offsetX == 0 && tanim.offsetY == 0){
										tanim.__callback && tanim.__callback.apply(tmp);
										tmp.anim.remove(j);
									}
								}else if (tanim.animationType == b.ROTATETO){
									if ((tanim.newX > 0 && 	tmp.angle >= tanim.newX) || (tanim.newX < 0 && tmp.angle <= tanim.newX)){
										tmp.angle = tanim.newX;
										tanim.__callback &&	tanim.__callback.apply(tmp);
										tmp.anim.remove(j);
									}else{
										tanim.offset = radians(tanim.degree / (tanim.timeToReach / Engine.__renderSpeed));
										tmp.angle += tanim.offset;
									}
								}else if (tanim.animationType == b.TIMEOUT){
									if (millis() - tanim.offsetY > tanim.offsetX){
										if (tanim.__callback){
											tanim.__callback.apply(tmp);
										}
										tmp.anim.remove(j);
									}
								}
							}while(j);
						}else{
							tmp.animationStarted = false;
						}
					}
					/* */
					if (tmp._context)
						var ec = tmp._context;
					else
						var ec = Engine.context;
					if (tmp.angle != 0){
						tmp.__toRestore = true;
						ec.save();
						ec.translate(tmp.x + tmp.translatedX,tmp.y + tmp.translatedY);
						ec.rotate(tmp.angle);
						ec.translate(-tmp.x - tmp.translatedX,-tmp.y - tmp.translatedY);
					}else
						tmp.__toRestore = false;
					
					if (tmp.skew){
						if (!tmp.__toRestore){
							ec.save();
							tmp.__toRestore = true;
						}
						ec.transform(1,tmp.skew.x,tmp.skew.y,1,0,0);
					}
					
					if (tmp.opacity != 1){
						if (tmp.opacity < 0) tmp.opacity = 0;
						if (tmp.opacity > 1) tmp.opacity = 1;
						setOpacity(tmp.opacity);
					}
				}
				
				if (tmp.shadow){
					var es = tmp.shadow;
					ec.shadowOffsetX = es.offX;
					ec.shadowOffsetY = es.offY;
					ec.shadowColor=es.color;
					ec.shadowBlur = es.blur;
				}
				/* Draw */
				notSkipFrame && !tmp._ui && tmp.enabled && tmp.draw(ec);
				if (tmp.shadow){
					ec.shadowOffsetX = 0;
					ec.shadowOffsetY = 0;
					ec.shadowBlur = 0;
					ec.shadowColor="transparent";
				}
						
				/* after process internal */
				tmp.opacity != 1 && setOpacity(1);

				tmp.__toRestore && ec.restore();
				
				if (tmp.reflection){
					ec.save();
					ec.translate(0, tmp.height);
					tmp.draw(ec);
					ec.translate(tmp.x, tmp.y);
					var grad = ec.createLinearGradient(0, 0, 0, tmp.height); 
					grad.addColorStop(0, tmp.reflection.c1);
					grad.addColorStop(tmp.reflection.height / tmp.height, tmp.reflection.c2); 
					ec.fillStyle = grad; 
					ec.rect(0, 0, 100, 100); 
					ec.fill();
					ec.restore();
				}
				
				if(!tmp._ui && tmp.enabled && tmp.afterProcess)
					tmp.afterProcess();
			}while(i);
		}
	
		if (notSkipFrame && this.asScreen){
			fill(e.bgColor.r,e.bgColor.g,e.bgColor.b);
			rect(0,0,this.x,this.y);
			rect(0,0,this.x,eh);
			rect(this.width,0, ew, eh);
			rect(0,this.height,ew,eh);
		}
		
		this.afterRender &&	this.afterRender();
	}
	
	
}
Area.prototype.constructor = Area;

Area.EMTPY = 0;
Area.PRELOADING = 1;	/* Process matrix from database */
Area.LOADING = 2;		/* Loading linked ressources */
Area.LOADED = 3;		/* All data are loaded */

/*
	Class: BaseElement
	Base class for element, do not instanciate
*/
var BaseElement = Base.extend({
	pathModifier : { type : 0 },	draggable : false,			processable : false,	
	visible : true,					enabled : true,				owner : 0,
	stucked : false,				coefficient : 1,
	displayMode : 0,				lastWidth : 0,				lastHeight : 0, 
	lastX : 0,						lastY : 0, 					lastVisible : 0,
	animationStarted : false,		animationType : null,		__callback : null,
	dragStarted : false,			dragOffsetX : 0,			dragOffsetY : 0,
	mouseEntered : false,			mouseClicked : false,		draggedObject : null,
	keydown : false,				focused : false,			width : 0,
	height : 0,						angle : 0,					translatedX : 0,
	translatedY : 0,				percent : 0,				changementStack : 0,
	scaling : 0,					x : 0,						y : 0,
	rightBound : 0,					bottomBound : 0,			boundingBox :0,
	state : 0,						anim : 0,					opacity : 1,
	shadow : 0,						skew : 0,					reflection : 0,
	
	
	/* Variable: x 
		Never set x by yourself, use setPos, setPosX
	*/
	
	/* Variable: y
		Never set y by yourself, use setPos, setPosY
	*/
	
	/* Variable: rightBound
		Never set by yourself
	*/
	
	/* Variable: bottomBound
		Never set by yourself
	*/
	
	
	/* Variable: visible
		Never set visible by yourself, use show or hide methods
	*/
	
	/* Variable: enabled
		Never set enabled by yourself, use enable, disable
	*/
	
	/* Variable: stucked
		Never set stucked by yourself, use stuck, unstuck
	*/
	
	/* Variable: height
		Never set height by yourself, use scale method
	*/
	
	/* Variable: width
		Never set width by yourself, use scale method
	*/
	
	/* Variable: state
		Current state of the element, you can append your own state into this
	*/
	
	/* Variable: opacity
		Never set opacity by yourself, use setOpacity
	*/
	
	/* Variable: _area
		A reference to the area containing this element
	*/
	
	/* Variable: _zIndex
		Layer position
	*/
	
	destruct : function(){
		delete this.anim;
		delete this.scaling;
		delete this.percent;
		delete this.changementStack;
		delete this.boundingBox;
	},
	
	/*
		Constructor: BaseElement
		Parameters:
		x - x position
		y - y position
	*/
	constructor : function(x,y){
		this.anim = [];
		this.x = x;	
		this.y = y;
		this.rightBound = x;				
		this.bottomBound = y;
		this.scaling = new Vector(1,1,0);
		this.percent = new Vector();
		this.changementStack = [];
		this.boundingBox =  [0,0,0,0, BaseElement.RECT];
		var f = Functions.functionExists;
		
		if (f("keyDown", this) && f("keyUp", this)){
			this.keyPressHandler = true;
		}
		if (f("onMouseUp", this) && f("onMouseDown", this)){
			this.clickHandler = true;
		}
		if (f("onFocus", this) && f("onBlur", this)){
			this.focusHandler = true;
		}
		
		if (f("mouseEnter",this) && f("mouseOver",this) && f("mouseLeave",this)){
			this.mouseOverHandler = true;	
		}
		
		this.haveEvent = this.keyPressHandler | this.clickHandler | this.focusHandler | this.focusHandler | this.mouseOverHandler | this.draggable;	
	},
	
	/*	
		Function: hit
		Check if this element hit an other element, by bounding box.
		
		Parameters:
		b - array, 0-3 bounding values, 4 bouding type : BaseElement.RECT, BaseElement.CIRCLE
	*/
	hit : function(b){
		if (this.boundingBox[4] == BaseElement.RECT){
			var eca = Engine.currentArea;
			return ((eca.x + this.x + this.boundingBox[0] < eca.x + b.x + b.boundingBox[2])
			&& (eca.x + this.x + this.boundingBox[2] > eca.x + b.x + b.boundingBox[0])
			&& (eca.y + this.y + this.boundingBox[1] < eca.y + b.y + b.boundingBox[3])
			&& (eca.y + this.y + this.boundingBox[3] > eca.y + b.y + b.boundingBox[1]));
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			return Functions.fastDistance(this.x + this.translatedX,this.y + translatedY, b.x + b.translatedX, b.y + b.translatedY) < this.boundingBox[0] * b.boundingBox[0];
		}
	},

	/* 
		Function: stuck
	*/
	stuck : function(){
		this.stucked = true;
	},
	
	/*
		Function: unstuck
	*/
	unstuck : function(){
		this.stucked = false;
	},
	
	/*
		Function: setRotation
		Rotation by an angle in degree
		
		Parameters:
		angle - angle
		radian - false by default
	*/
	setRotation : function(angle, radian){
		if (this.stucked) return;
		if (radians == undefined || !radian)
			this.angle = radians(angle % 360);
		else
			this.angle = angle;
	},
	
	/*
		Function: setPos
		Change the position of the object (in pixel)
		
		Parameters:
		force - change elem position even if engin currently rendering a frame
	*/
	setPos : function(x, y, force){
		if (force){
			BaseElement.setPosX_internal(this,x);
			BaseElement.setPosY_internal(this,y);
		}else{
			this.setPosX(x);
			this.setPosY(y);
		}
	},
		
	/*
		Function: setPosX
		Set x pos of the element
		
		Parameters:
		x - x pos
	*/
	setPosX : function(x){
		if (!this.enabled) return;
		this.changementStack.push([BaseElement.SETPOSX,x]);
	},
	
	/*
		Function: setPosY
		Set y pos of the element
		
		Parameters:
		y - y pos
	*/
	setPosY : function(y){
		if (!this.enabled) return;
		this.changementStack.push([BaseElement.SETPOSY, y]);
	},
	
	/*
		Function: remove
		This object will be remove, then never display again after process will not be called
	*/
	remove : function(){
		this._afterProcess = this.afterProcess;
		this.afterProcess = function(){
			if (this._afterProcess){
				var tmp = this._afterProcess;
				this._afterProcess = null;
				tmp.call(this);
			}
			Engine.currentArea.layers.remove(this);
		}
	},
	
	
	/*
		Function: setWidth
		Set the width of the element
		
		Parameters:
		width - width
	*/
	setWidth : function(width){
		if (this.scaledWidth == width) return;
		this.scaledWidth = floor(width);
		this.rightBound = this.x + this.scaledWidth;
	},
	
	/*
		Function: setHeight
		Set the height of the element
		
		Parameters:
		height - height
	*/
	setHeight : function(height){
		if (this.scaledHeight == height) return;
		this.scaledHeight = floor(height);
		this.bottomBound = this.y + this.scaledHeight;
	},
	
	/*
		Function: getWidth
		Return computed width
	*/
 	getWidth : function(){
		return this.scaledWidth;
	},
	
	/*
		Function: getHeigth
		Return computed height
	*/
	getHeight : function(){
		return this.scaledHeight;
	},
	
	/*
		Function: show
		Set this element visible
	*/
	show : function(){
		if (!this.enabled) return;
		this.visible = true;
		this.unstuck();
	},
	
	/*
		Function: hide
		Hide this element (will not be displayed anymore but will be processed)
	*/
	hide : function(){
		if (!this.enabled) return;
		this.visible = false;
		this.stuck();
	},
	
	/*
		Function: isVisible
		Return: true if drawable is inside the screen
	*/
	isVisible : function(){
		if (!this.visible) return false;
		var eca = Engine.currentArea;
		var e = Engine;
		if (this.x + eca.x < 0 && this.x  + this.scaledWidth  + eca.x < 0 || this.y  + eca.y < 0 && this.y + this.scaledHeight  + eca.y < 0)
			return false;
		else if (this.x  + eca.x > e.width || this.y  + eca.y > e.height) return false;
		
		return true;
	},
	
	/*
		Function: setOpacity
		Parameters:
		val - 0 to 1
	*/
	setOpacity : function(val){
		if (!this.enabled) return;
		elem.opacity = val;
	},
	
	/*
		Function: enable
		Instantaneously enable this element 
	*/
	enable : function(){
		this.enabled = true;
	},
	
	/*
		Function: disable
		Instantaneously disable this element (will not be processed anymore)
	*/
	disable : function(){
		this.enabled = false;
		BaseElement.applyChangementStack(this);
	},
	
	/*
		Function: isReady
		Always ready by default
	*/
	isReady : function(){
		return true;
	},
	
	/* 
		Function: dragStart
		Drag start default behavior (override if needed)
	*/
	dragStart : function(){
	},
	
	/*
		Function: drag
		Drag default behavior (override if needed) 
	*/
	drag : function(){
		var w = window;
		this.setPos(w.mouseX - this.dragOffsetX, w.mouseY - this.dragOffsetY);
	},

	/* 
		Function: dragStop
		Drop default behavior (override if needed) 
	*/
	dragStop : function(){	},
	
	/*
		Function: beforeProcess
		to be called beefore draw
	*/
	beforeProcess : null,
	
	/*
		Function: afterProcess
		To be called after draw
		
		Return: true if changement have been made (redraw needed)
	*/
	afterProcess : null,
	/* <divide> */
});

BaseElement.applyChangementStack = function(tmp){
	var b = BaseElement;
	if(!tmp.changementStack) return;
	var tmp2 = tmp.changementStack.pop();
	var tpm = tmp.pathModifier;
	while(tmp2){
		if (tmp2[0] == b.SETPOSX){
			if (tmp.x != tmp2[1] && !tmp.stucked){
				if ((tpm == null || tpm.type == b.NONE ) && !tpm.auto){
					tmp.x = tmp2[1];
				}else{
					if (tmp.owner){
						tmp.x = 0;
						tmp.x = b.applyPathModifierX(tmp, 0);
						tmp.x += tmp.owner.x;
					}else {
						tmp.x = b.applyPathModifierX(tmp, tmp2[1]);
					}
				}
				tmp.rightBound = tmp.x + tmp.scaledWidth;
			}
		}else if (tmp2[0] == b.SETPOSY){
			if (tmp.y != tmp2[1] && !tmp.stucked){
				if ((tpm == null || tpm.type == b.NONE ) && !tpm.auto ){
					tmp.y = tmp2[1];
				}else{
					if (tmp.owner){
						tmp.y = 0;
						tmp.y = b.applyPathModifierY(tmp, 0);
						tmp.y += tmp.owner.y;
					}else{
						tmp.y = b.applyPathModifierY(tmp, tmp2[1]);
					}
				}
				tmp.bottomBound = tmp.y + tmp.scaledHeight;
			}
		}
		tmp2 = tmp.changementStack.pop();
	}
}


/*
	Function: reset
	*Static*
	
	Reset x,y and angle
*/
BaseElement.reset = function(elem){
	elem.x = -Engine.currentArea.pos.x - elem.width;
	elem.y = -Engine.currentArea.pos.y - elem.height;
	elem.rightBound = elem.x + elem.scaledWidth;
	elem.bottomBound = elem.y + elem.scaledHeight;
	elem.angle = 0;
	elem.visible = true;
}

/*
	Function: setPathModifier
	*Static*
	
	Add a path modifier, when adding a path modifier the coordinates inserted with setPos
	will be computed to follow a kind of trajectory.
	
	Parameters:
	modifier - Json object : 
	
	{ 	type : 
				- NONE : disable path modifier	
	
			   - CIRCLE : follow a circle curve, if element is attached (BaseElement.attachTo) element will rotate arround it's owner
			   
			   - CIRCLE_Z1 : follow an elliptic curve , if element is attached (BaseElement.attachTo) element will rotate arround it's owner
			   
			   - CIRCLE_Z2 : follow an elliptic curve, if element is attached (BaseElement.attachTo) element will rotate arround it's owner
			   
			   - SINCURVE : follow a sin curve
			   
			   - HEADING : (have a rotation angle following the curve)
				
		radius : 10,				required : radius to use in computation
		
		step : 3,					required : angle += step
		
		angle : 4,					default 0 : start position angle
		
		offsetX : 20, 				default 0 : translation to apply in X
		
		offsetY : 20,				default 0 : translation to apply in Y
		
		auto : false,				default false : if true the modifier will be applied on each frame even if no change have been done on the position
		
		applyToX : true,			default true : if false no modification will be apply to X
		
		applyToY : true,			default true :	if false no modification will be apply to y
		
	}
	
*/
BaseElement.setPathModifier = function(elem, modifier){
	if (modifier.angle == undefined) modifier.angle = 0;
	if (modifier.offsetX == undefined) modifier.offsetX = 0;
	if (modifier.offsetY == undefined) modifier.offsetY = 0;
	if (modifier.auto == undefined && modifier.type != BaseElement.HEADING) modifier.auto = false;
	else if (modifier.type == BaseElement.HEADING) modifier.auto = true;
	if (modifier.applyToX == undefined) modifier.applyToX = true;
	if (modifier.applyToY == undefined) modifier.applyToY = true;
	modifier.state = 0;
	elem.pathModifier = modifier;
}

/*
	Function: resetPathModifier
	*Static*
	
	Reset path modifier
*/
BaseElement.resetPathModifier = function(){
	pathModifier = { type : NONE };
}

/*
	Function: enableDraggable
	*Static*
	
	Enable draggable mechanism to an element
	
	Parameters:
	elem - element
*/
BaseElement.enableDraggable = function(elem){
	if (!elem.draggable){
		Engine.addDragHandler(elem);
		elem.draggable = true;
		elem.haveEvent = elem.keyPressHandler | elem.clickHandler | elem.focusHandler | elem.focusHandler | elem.mouseOverHandler | elem.draggable;	
	}
}

/*
	Function: disableDraggable
	*Static*
	
	disable draggable to an element
	
	Parameters:
	elem - element
*/
BaseElement.disableDraggable = function(elem){
	if (elem.draggable){
		Engine.removeDragHandler(elem);
		elem.draggable = false;
		elem.haveEvent = elem.keyPressHandler | elem.clickHandler | elem.focusHandler | elem.focusHandler | elem.mouseOverHandler | elem.draggable;	
	}
}

/*
	Function: fadeIn
	*Static*

	Fade in animation
	
	Parameters:
	elem - element
	timeToReach - time to reach the end of animation
	callback - callback
*/
BaseElement.fadeIn = function(elem, timeToReach, callback){
	if (!elem.enabled) return;
	var anim = {};
	anim.animationType =  BaseElement.FADE_IN;
	anim.animationValue = 0;
	elem.animationStarted = true;
	elem.visible = true;
	elem.opacity = 0;
	anim.timeToReach = timeToReach;
	anim.offset = Engine.__renderSpeed / Math.abs(timeToReach);
	anim.__callback = callback;
	elem.anim.push(anim);
}

/*
	Function: fadeOut
	*Static*
	
	Fade out animation
	
	Parameters:
	elem - element
	timeToReach - time to reach the end of animation
	callback - callback
*/
BaseElement.fadeOut = function(elem, timeToReach, callback){
	if (!elem.enabled) return;
	var anim = {};
	anim.animationType =  BaseElement.FADE_OUT;
	anim.animationValue = 255;
	elem.animationStarted = true;
	anim.timeToReach = timeToReach;
	anim.offset = Engine.__renderSpeed / Math.abs(timeToReach);
	anim.__callback = callback;
	elem.anim.push(anim);
}


/*
	Function: goTo
	*Static*
	
	Move the base element from the current position to an other
	
	Parameters:
	timeToReach - in ms
	update - if true only x2 and y2 are changed
*/
BaseElement.goTo = function(elem, x2, y2, timeToReach, callback){
	if (!elem.enabled) return;
	var anim = {};
	elem.animationStarted = true;
	anim.animationType = BaseElement.GOTO;
	anim.newX = x2 - elem.x;
	anim.newY = y2 - elem.y;
	anim.startTime = millis();
	if (timeToReach == undefined) timeToReach = Math.max(elem.anim.newX,elem.anim.newY) * 2;
	anim.endTime = elem.anim.startTime + timeToReach;
	anim.timeToReach = timeToReach;
	anim.startX = elem.x;
	anim.startY = elem.y;
	if (typeof(callback) == 'function')
		anim.__callback = callback;
	else anim.__callback = null;
	elem.anim.push(anim);
}

/*
	Function: scaleTo
	*Static*
	
	Apply a smoothed scale effect
	
	Parameters:
	elem - element
	newScaleX - end scale X
	newScaleY - end scale Y
	timeToReach - time to reach end of animation
	centered - scale is centered, boolean
	callback - callback
*/
BaseElement.scaleTo = function(elem, newScaleX, newScaleY, timeToReach, centered, callback){
	if (!elem.enabled) return;
	var anim = {};
	elem.animationStarted = true;
	anim.animationType = BaseElement.SCALETO;
	anim.timeToReach = timeToReach;
	anim.offsetX = newScaleX - elem.scaling.x;
	anim.offsetY = newScaleY - elem.scaling.y;
	anim.newX = newScaleX;
	anim.newY = newScaleY;
	if (centered)
		elem.scaling.z = 1;
	else
		elem.scaling.z = 0;
	anim.__callback = callback;
	elem.anim.push(anim);
}

/*
	Function: rotateTo
	*Static*
	
	Apply a smoothed rotation effect
	
	Parameters:
	elem - element
	degree - degree
	timeToReach - time to reach the end of animation
	callback - callback
*/
BaseElement.rotateTo = function(elem, degree, timeToReach, callback){
	if (!elem.enabled) return;
	var anim = {};
	elem.animationStarted = true;
	anim.animationType = BaseElement.ROTATETO;
	anim.degree = degree;
	anim.timeToReach = timeToReach;
	anim.offset = radians(elem.anim.degree / (elem.anim.timeToReach / Engine.__renderSpeed));
	anim.newX = radians(degree);
	anim.__callback = callback;
	elem.anim.push(anim);
}

/*
	Function: skew
	*Static*
	
	Apply a skew effect
	
	Parameters:
	elem - element
	x - x 
	y - y
*/
BaseElement.skew = function(elem, x, y){
	elem.skew = { 'x' : x, 'y' : y}
}

/*
	Function: skewTo
	*Static*
	
	Apply a smoothed skew effect
	
	Parameters:
	elem - element
	skewX - end skew x
	skewY - end skew y
	timeToReach - time to reach the end of animation
	callback - callback
*/
BaseElement.skewTo = function(elem,skewX,skewY, timeToReach, callback){
	if (!elem.enabled) return;
	var anim = {};
	elem.animationStarted = true;
	anim.animationType = BaseElement.SKEWTO;
	anim.timeToReach = timeToReach;
	if (!elem.skew) elem.skew = {'x':0,'y':0}
	anim.offsetX = skewX - elem.skew.x;
	anim.offsetY = skewY - elem.skew.y;
	anim.newX = skewX;
	anim.newY = skewY;
	anim.__callback = callback;
	elem.anim.push(anim);
}

/*
	Function: timeOut
	*Static*
	
	Execute a functor after a minimum delay
	
	Another call to this method on the same object disable the first call
	
	Parameters:
	elem - element
	delay - delay
	callback - callback
*/
BaseElement.timeOut = function(elem, delay, callback){
	if (!elem.enabled) return;
	var anim = {};
	elem.animationStarted = true;
	anim.animationType = BaseElement.TIMEOUT;
	anim.offsetX = delay;
	anim.offsetY = millis();
	anim.__callback = callback;
	elem.anim.push(anim);
}

/*
	Function: advanceBy
	*Static*
	
	Advance by one step in a direction taking in count a time line
	
	Parameters:
	elem - element 
	x2 - x offset
	y2 - y offset
	timeToReach - if undefined a linear timeline is taken
*/
BaseElement.advanceBy = function(elem, x2, y2, timeToReach){
	if (!timeToReach) timeToReach = Math.max(Math.abs(x2), Math.abs(y2));
	var tmp = Engine.__renderSpeed / Math.abs(timeToReach);
	elem.setPos(elem.x + x2 * tmp, elem.y + y2 * tmp);
}

/*
	Function: stop
	*Static*
	
	Stop the current animation
	
	Parameters:
	elem - element
*/
BaseElement.stop = function(elem){
	elem.animationStarted = false;
	elem.animationType = -1;
	elem.offset = 0;
	elem.animationValue = 0;
	elem.offsetX = 0;
	elem.offsetY = 0;
	elem.newX = 0;
	elem.newY = 0;
}

BaseElement.setPosX_internal = function(elem, x){
	if (elem.x == x || elem.stucked) return;
	if ((elem.pathModifier == null || elem.pathModifier.type == BaseElement.NONE ) && !elem.pathModifier.auto )
		elem.x = x;
	else
		elem.x = BaseElement.applyPathModifierX(elem, x);
	elem.rightBound = elem.x + elem.scaledWidth;
}

BaseElement.setPosY_internal = function(elem, y){
	if (elem.y == y || elem.stucked) return;
	if (elem.pathModifier == null || elem.pathModifier.type == BaseElement.NONE || !elem.pathModifier.auto )
		elem.y = y;
	else
		elem.y = BaseElement.applyPathModifierY(elem, y);
	elem.bottomBound = elem.y + elem.scaledHeight;
}

BaseElement.applyPathModifierX = function(elem, x){
	if (!elem.pathModifier.applyToX) return x;
	if (elem.pathModifier.type == BaseElement.CIRCLE){
		return x + elem.pathModifier.offsetX + elem.pathModifier.radius * Math.cos(radians(elem.pathModifier.angle));
	}else if (elem.pathModifier.type == BaseElement.CIRCLE_Z1 || elem.pathModifier.type == BaseElement.SINCURVE){
		return x + elem.pathModifier.offsetX + elem.pathModifier.radius * Math.sin(radians(elem.pathModifier.angle));
	}else if (elem.pathModifier.type == BaseElement.CIRCLE_Z2){
		return x + elem.pathModifier.offsetX + elem.pathModifier.radius * -Math.sin(radians(elem.pathModifier.angle));
	}else {
		return x;
	}
}

BaseElement.applyPathModifierY = function(elem, y){
	if (!elem.pathModifier.applyToY) return y;
	if (elem.pathModifier.type == BaseElement.CIRCLE){
		return y + elem.pathModifier.offsetY + elem.pathModifier.radius * Math.sin(radians(elem.pathModifier.angle));
	}else if (elem.pathModifier.type == BaseElement.CIRCLE_Z1 || elem.pathModifier.type == BaseElement.SINCURVE){
		return y + elem.pathModifier.offsetY + elem.pathModifier.radius * Math.sin(radians(elem.pathModifier.angle));
	}else if (elem.pathModifier.type == BaseElement.CIRCLE_Z2){
		return y + elem.pathModifier.offsetY + elem.pathModifier.radius * Math.sin(radians(elem.pathModifier.angle));
	}else{
		return y;
	}
}


/*
	Function: isOver
	*Static*
	
	Return true if the mouse is over the instanciated base element
	
	Parameters:
	elem - element
*/	
BaseElement.isOver = function(elem){
	var w = window;
	if (elem.boundingBox[4] == BaseElement.RECT){
		var tmpX = elem.x + Engine.currentArea.x;
		var tmpY = elem.y + Engine.currentArea.y;
		return ((tmpX + elem.boundingBox[0]) <= w.mouseX && (tmpY + elem.boundingBox[1]) <= w.mouseY && w.mouseX <= (tmpX + elem.boundingBox[2]) &&  w.mouseY <= (tmpY + elem.boundingBox[3]));
	}else if (elem.boundingBox[4] == BaseElement.CIRCLE){
		return Functions.fastDistance(elem.x + elem.translatedX, elem.y + elem.translatedY, w.mouseX, w.mouseY) <= elem.boundingBox[0] * elem.boundingBox[0];
	}
}

/*
	Function: setRotationCenter
	*Static*
	
	Default center of the image
	
	Parameters:
	elem - element
	x - x pos
	y - y pos
*/
BaseElement.setRotationCenter = function(elem, x, y){
	elem.translatedX = x;
	elem.translatedY = y;
}

/*
	Function: rotateToDirection
	*Static*
	
	Apply a rotation angle to facing in (x,y) direction
	
	Parameters:
	elem - element
	x - x pos
	y - y pos
*/
BaseElement.rotateToDirection = function(elem,x,y){
	elem.setRotation(Functions.polarAngle(elem.x - x, elem.y - y),true);
}

/*
	Function: 
	*Static*
	
	Change bounding box standard properties
	
	Parameters:
	xPos - relative to the baseElement
	yPos - relative to the baseElement
*/
BaseElement.setBoundingBox = function(elem, xPos, yPos, bWidth, bHeight){
	elem.boundingBox[0] = xPos;
	elem.boundingBox[1] = yPos;
	elem.boundingBox[2] = bWidth;
	elem.boundingBox[3] = bHeight;
	elem.boundingBox[4] = BaseElement.RECT;
}

/*
	Function: 
	*Static*
	
	Transform the standard rect boundingbox into a circle bounding box, for hit function and isOver function
	
	Parameters:
	elem - element
	radius - radius
*/
BaseElement.setCircleBoundingBox = function(elem, radius){
	elem.boundingBox[4] = BaseElement.CIRCLE;
	elem.boundingBox[0] = radius;
}

/*
	Function: 
	*Static*
	
	Center the element at (x,y)
	
	Parameters:
	elem - element
	x - x pos
	y - y pos
*/
BaseElement.centerOn = function(elem, x, y){
	elem.setPos(x- (elem.width >>> 1),y - (elem.height >>> 1));
}

/*
	Function: 
	*Static*
	
	Execute a function on next frame
	
	Parameters:
	arguments[0] - functor
	arguments[1] - instance
	arguments[2..x] - params, optional
*/
BaseElement.doAfter = function(){
	var args = [];
	for (var i = 1; i < arguments.length; i++){
		args[i - 1] = arguments[i];
	}
	arguments[1].changementStack.push({"fonc":arguments[0], "args" : [args]});
}

/*
	Function: attachTo
	*Static*
	
	Attach the element to an other, at each computed frame the element will take the owner top left position
	
	Parameters:
	elem - element
	owner - owner
*/
BaseElement.attachTo = function(elem, owner){
	elem.owner = { 'elem' : owner, 'offsetX' : 0, 'offsetY' : 0};
}

/*
	Function: detach
	*Static*
	
	Detach the element attached to another element
	
	Parameters:
	elem - element
*/
BaseElement.detach = function(elem){
	elem.owner = null;
}

/*
	Function: addShadow
	*Static*
	
	Paraments:
	blur - blur width
*/
BaseElement.addShadow = function(elem, offsetX, offsetY, blur, c){
	elem.shadow = {
		offX:offsetX,
		offY:offsetY,
		'blur' : blur,
		'color' : c.toString()
	}
}

/*
	Function: addShadow
	*Static*
	
	Parameters:
	elem - element
*/
BaseElement.removeShadow = function(elem){
	elem.shadow = null;
}

/*
	Function: reflection
	*Static*
	
	Parameters:
	elem - element
	height - shadow height
	startOpacity - opacity
	gradientColor - color gradient obtained with makeGradient function
*/
BaseElement.reflection = function(elem, height, startOpacity, gradientColor){
	c1 = color(gradientColor.r,gradientColor.g,gradientColor.b,0);
	c2 = color(gradientColor.r,gradientColor.g,gradientColor.b,1);
	elem.reflection = { 'height' : height, 'opacity' : startOpacity, 'c1' : c1, 'c2' : c2 }
}

/*
	Function: getPixels
	*Static*
	
	Get pixels form an element
	
	Parameters:
	elem - element
*/
BaseElement.getPixels = function(elem){
	var bufferCanvas = document.createElement('canvas');
	bufferCanvas.width = Engine.width;
	bufferCanvas.height = Engine.height;
	bufferCanvas.webkitImageSmoothingEnabled = true;
	bufferCanvas.mozImageSmoothingEnabled = true;
	var context = bufferCanvas.getContext('2d');
	var savedContext = Engine.context;
	Engine.context = context;
	elem.draw();
	Engine.context = savedContext;
	return context.getImageData(elem.x, elem.y, elem.width, elem.height).data;
}

/*
	Function: setPixels
	*Static*
	
	When setting pixels your element is converted to a BufferedDrawable
	
	Parameters:
	elem - element
	pixels - pixels array
*/
BaseElement.setPixels = function(elem,pixels){
	var bufferCanvas  = document.createElement('canvas');
	bufferCanvas.width = elem.scaledWidth;
	bufferCanvas.height = elem.scaledHeight;
	bufferCanvas.webkitImageSmoothingEnabled = true;
	bufferCanvas.mozImageSmoothingEnabled = true;
	var context = bufferCanvas.getContext('2d');
	context.setImageData(0, 0, width, height, pixels);
	elem.im = bufferCanvas;
}

/*
	Function: pixelScale
	*Static*
	
	Offer a way to scale your element by giving pixels dimensions
	
	Parameters:
	elem - element to scale
	width - new width in pixel
	height - new height in pixel
*/
BaseElement.pixelScale = function(elem, width, height){
	elem.scale(width / elem.width, height / elem.height);
}

/*
	Function: pixelScaleWidth
	*Static*
	
	Offer a way to scale width of your element by giving pixels dimensions
	
	Parameters:
	elem - element to scale
	width - new width in pixel
*/
BaseElement.pixelScaleWidth = function(elem, width){
	elem.scale(width / elem.width, -1);
}

/*
	Function: pixelScaleHeight
	*Static*
	
	Offer a way to scale height of your element by giving pixels dimensions
	
	Parameters:
	elem - element to scale
	height - new height in pixel
*/
BaseElement.pixelScaleHeight = function(elem, height){
	elem.scale(-1, height / elem.height);
}

BaseElement.FADE_IN = 0;
BaseElement.FADE_OUT = 1; 
BaseElement.GOTO = 2; 
BaseElement.SCALETO = 4; 
BaseElement.ROTATETO = 5;
BaseElement.TIMEOUT = 6;
BaseElement.SKEWTO = 7;
BaseElement.NONE = 0; 
BaseElement.CIRCLE = 1; 
BaseElement.SINCURVE = 2; 
BaseElement.HEADING = 3; 
BaseElement.CIRCLE_Z1 = 4; 
BaseElement.CIRCLE_Z2 = 5;
BaseElement.RECT = 0;
BaseElement.CIRCLE = 1;
BaseElement.SETPOSX = 0;
BaseElement.SETPOSY = 1;
/*
	Class: Drawable
	Inherits from:
	- <BaseElement>
	
	An image base element, image are processed faster if the size is a multiple of 8
	extends BaseElement
*/
var Drawable = BaseElement.extend({
	instanceName : "Drawable",
	/*
		Variable: imageName
	*/
	imageName : "",
	
	destuct : function(){
		this.base();
		delete this.im;
	},
	
	/* Constructor: Drawable
		Parameters:
		x - x pos
		y - y pos
		imName - image path
	*/
	constructor : function(x, y, imName){
		this.base(x,y);
		this.imageName = imName;
		this.ready = false;
		if (this.imageName != ""){
			this.im = Library.get(imName);
			if (this.im == null){
				Library.addImage(imName);
			}
		}
		this._startX = 0;
		this._startY = 0;
	},
	
	/*
		Function: isReady
		Return true if the image is well loaded
	*/
	isReady: function(){
		if (this.ready) return true;
		
		if (this.im == null || this.im == -1){
			this.im = Library.get(this.imageName);
			return false;
		}
		if (this.im != null){
			this.width = this.im.width;
			this.height = this.im.height;
			if (this.scaling.x != 1) this.width *= this.scaling.x;
			if (this.scaling.y != 1) this.height *= this.scaling.y;
			this.rightBound = this.x + this.width;
			this.bottomBound = this.y + this.height;
			this.translatedX = floor(this.width * 0.5);
			this.translatedY = floor(this.height * 0.5);
			this.scaledWidth = floor(this.width);
			this.scaledHeight = floor(this.height);
			this.ready = true;
			if (this.boundingBox[2] == 0 && this.boundingBox[3] == 0){
				this.boundingBox[2] = floor(this.scaledWidth);
				this.boundingBox[3] = floor(this.scaledHeight);
			}
			if (this.onReady) this.onReady();
			return true;
		}else{
			return false;
		}
	},
	
	/*
		Function: draw
		Draw the image
		
		Parameters:
		c - context where to draw
	*/
	draw: function(c){
		if (!this.ready && !this.isReady() || !this.isVisible()) return;
		if (DEBUG_MODE){
			if (this.im == null || this.im == 0 || this.im == undefined){
				console.error("Image " + this.imageName + " is not well loaded, check image path");
			}
		}
		if (this.strokeColor && this.strokeWidth){
			stroke(this.strokeColor);
			lineWidth(this.strokeWidth);
			rect(this.x, this.y, this.scaledWidth, this.scaledHeight);
		}
		c.drawImage(this.im,floor(this._startX),floor(this._startY),this.width,this.height,floor(this.x),floor(this.y),this.scaledWidth, this.scaledHeight);
		if (this.strokeColor && this.strokeWidth){
			noStroke();
		}
	},
	
	/*
		Function: onReady
		Override this function called when image is loaded
	*/
	onReady : null,
	
	/*
		Scale current element
		@param x : float value, 1 = original size
		@param y : float value, 1 = original size
		@param center : if true scale is centered, else scale is left corner based
	*/
	scale$3 : function(x, y, center){
		if (this.scaling == null) this.scaling = new Vector();
		if (x >= 0)
			this.scaling.x = x;
		if (y >= 0)
			this.scaling.y = y;
		if (center)
			this.scaling.z = 1;
		else
			this.scaling.z = 0;
		if (this.im == undefined) return;
		this.scaledWidth = floor(this.im.width * this.scaling.x);
		this.scaledHeight = floor(this.im.height * this.scaling.y);
		if (this.scaling.z){
			this.x += this.translatedX - floor(this.scaledWidth * 0.5);
			this.y += this.translatedY - floor(this.scaledHeight * 0.5);
		}
		this.rightBound = this.x + this.scaledWidth;
		this.bottomBound = this.y + this.scaledHeight;
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
	
	
	/*
		Function: scale
		Parameters:
		x - x pos
		y - y pos
		centered - optional
	*/
	scale : function(){
		if(arguments.length == 2){
			this.scale$3(arguments[0],arguments[1],this.scaling.z);
		}else{
			this.scale$3.apply(this,arguments);
		}
	},
	
	/*
		Function: addBorder
		Display a border around the Drawable
		
		Parameters:
		c - border color
		w - border width
	*/
	addBorder : function(c, w){
		this.strokeColor = c;
		this.strokeWidth = w;
	},
	
	
	/*
		Function: removeBorder
		Remove current border applied to this drawable
	*/
	removeBorder : function(){
		this.strokeColor = null;
		this.strokeWidth = null;
	}
	
});

/*
	Function: changeImage
	*static*
	Permit to change elem image
	
	Parameters:
	elem - element
	imName - image path
	callback - optional
*/
Drawable.changeImage = function(elem, imName, callback){
	elem.imageName = imName;
	elem.im = library.get(imName);
	if (!elem.im){
		Library.addImage(imName);
	}
	elem.scaling.x = 1;
	elem.scaling.y = 1;
	elem.scaling.z = 0;
	elem.ready = false;
	elem.onReady = callback;
}

/*
	Class: AnimatedDrawable
	Inherits from:
	- <Drawable>

	Extends drawable to display sprites, can also display standard drawable if swidth or sHeight set to 0
	extends Drawable

	Parameters:
	x - position in pixel 
	y - position in pixel 
	imName - name or path to an  image
	sWidth - sprite width (one cell)
	sHeight - sprite height (one cell)
*/
var AnimatedDrawable = Drawable.extend({
	instanceName : "AnimatedDrawable",
	speed : 0,
	tSprite : null,
	step : 0,
	steps : null,
	auto : true,
	sequences : null,
	sequence : -1,
	visibleAfter : true,
	processedReady : false,
	simpleDrawable : false,
	sequenceCallback : null,
	started : true,
	
	destuct : function(){
		this.base();
		delete this.steps;
		delete this.tSprite;
	},
	
	/* 
		Constructor: AnimatedDrawable
		
		Parameters:
		x - x pos
		y - y pos
		imName - image path
		swidth - sprite width
		sHeight - sprite height
		sSpeed -  animation speed
	*/
	constructor : function(x, y, imName, sWidth, sHeight, sSpeed){
		this.base(x,y,imName);
		this.spriteWidth = sWidth;
		this.spriteHeight = sHeight;
		this.speed = sSpeed;
		if (this.speed != 0){
			this.tSprite = new Timer(sSpeed);
		}
	},
	
	/*
		Function: isReady
		Return true if the image is well loaded and if the differents step have been created
	*/
	isReady : function(){
		if (this.processedReady) return true;
		if (this.im == null || this.im == -1){
			this.im = Library.get(this.imageName);
			return false;
		}
		if (this.spriteWidth == 0 || this.spriteHeight == 0){
			this.steps = null;
			this.simpleDrawable = true;
			this.processedReady = true;
			this.width = this.im.width;
			this.height =  this.im.height;
			this.spriteWidth = this.width;
			this.spriteHeight = this.height;
			if (this.scaling.x != 1) this.scaledWidth = this.width * this.scaling.x;
			else this.scaledWidth = floor(this.width);
			if (this.scaling.y != 1) this.scaledHeight = this.height * this.scaling.y;
			else this.scaledHeight = floor(this.height);
			this.translatedX = floor(this.scaledWidth * 0.5);		
			this.translatedY = floor(this.scaledHeight * 0.5);
			this.rightBound = this.x + this.scaledWidth;
			this.bottomBound = this.y + this.scaledHeight;
			if (this.boundingBox[2] == 0 && this.boundingBox[3] == 0){
				this.boundingBox[2] = this.scaledWidth;
				this.boundingBox[3] = this.scaledHeight;
			}
			if (this.onReady) this.onReady();
			return true;
		}
		this.width = floor(this.spriteWidth);
		this.height = floor(this.spriteHeight);
		if (this.scaling.x != 1) this.scaledWidth = this.width * this.scaling.x;
		if (this.scaling.y != 1) this.scaledHeight = this.height * this.scaling.y;
		this.translatedX = floor(this.width * 0.5);		
		this.translatedY = floor(this.height * 0.5);
		this.rightBound = this.x + this.width;
		this.bottomBound = this.y + this.height;
		this.scaledWidth = floor(this.width);
		this.scaledHeight = floor(this.height);
		this.steps = Library.get(this.imageName + "_animated");
		if (this.steps == null){
			this.steps = [];
			var l = floor(this.im.width / this.spriteWidth);
			for (var i = 0; i < l; i++){
				this.steps[i] = floor(i * this.spriteWidth);
			}
			Library.addObject(this.imageName + "_animated", this.steps);
		}
		
		if (this.boundingBox[2] == 0 && this.boundingBox[3] == 0){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}
		this.processedReady = true;
		if (this.onReady) this.onReady();
		return true;
	},
	
	/*
		Function: draw
		Draw and animate the sprite 
		
		Parameters:
		ec - context where to draw
	*/
	draw : function(ec){
		if (!this.processedReady && !this.isReady()) return;
		
		if (!this.isVisible()) return;
		
		if (DEBUG_MODE){
			if (this.im == null || this.im == 0 || this.im == undefined){
				console.error("Image " + this.imageName + " is not well loaded, check image path");
			}
		} 
		
		if (this.simpleDrawable) {
			ec.drawImage(this.im,0,0,this.width,this.height,floor(this.x),floor(this.y),this.scaledWidth, this.scaledHeight);
			return;
		}
		
		if (this.started){
			if (this.auto && this.tSprite.itsTime() && this.sequences == null ){
				this.step = ++this.step % this.steps.length;
			}else if(this.sequences != null && this.sequence >= 0){
				if (this.sequences[this.sequence][1] > this.sequences[this.sequence][0]){
					if(this.sequences[this.sequence][1] > this.step){
						this.tSprite.itsTime() && this.step++;
					}else{
						this.sequenceCallback != null && this.sequenceCallback.apply(this);
						if (this.auto){
							this.step = this.sequences[this.sequence][0];
						}
					}
				}else{
					if(this.sequences[this.sequence][1] < this.step){
						this.tSprite.itsTime() && this.step--;
					}else{
						this.sequenceCallback != null && this.sequenceCallback.apply(this);
					}
				}
			}
			ec.drawImage(this.im,this.steps[this.step],0, this.spriteWidth, this.spriteHeight, floor(this.x),floor(this.y), this.scaledWidth, this.scaledHeight);
		}		
	},
	
	/*
		Scale current element
		@param x : float value, 1 = original size
		@param y : float value, 1 = original size
		@param center : if true scale is centered, else scale is left corner based
	*/
	scale$3 : function(x, y, center){
		if (this.scaling == null) this.scaling = new Vector();
		if (x >= 0)
			this.scaling.x = x;
		if (y >= 0)
			this.scaling.y = y;
		if (center)
			this.scaling.z = 1;
		else
			this.scaling.z = 0;
		
		if (this.im == undefined) return;
		this.scaledWidth = floor(this.spriteWidth * this.scaling.x);
		this.scaledHeight = floor(this.spriteHeight * this.scaling.y);
		if (this.scaling.z == 1){
			this.x += this.translatedX - floor(this.scaledWidth * 0.5);
			this.y += this.translatedY - floor(this.scaledHeight * 0.5);
		}
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		this.rightBound = this.x + this.scaledWidth;
		this.bottomBound = this.y + this.scaledHeight;
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
		
	/*
		Function: scale 
		Scale current element
		
		Parameters:
		x - float value, 1 = original size
		y - float value, 1 = original size
		center - if true scale is centered, else scale is left corner based
	*/
	scale : function(){
		if (arguments.length == 2)
			this.scale$3(arguments[0],arguments[1],this.scaling.z);
		else
			this.scale$3.apply(this,arguments);
	},
	
	/*
		Function: remove
		Remove this element
	*/
	remove : function(){
		delete this.imageName;
		this.base();
	}
});


/*
	Function: start
	Start a paused or stopped animation
	
	Parameters:
	elem - element
*/
AnimatedDrawable.start = function(elem){
	elem.started = true;
};

/*
	Function: stopSequence
	Reset the current animation
	
	Parameters:
	elem - element
*/
AnimatedDrawable.stopSequence = function(elem){
	if (elem.sequences != null)
		elem.step = elem.sequences[elem.sequence][0];
};

/*
	Function: pause
	Pause current animation
	
	Parameters:
	elem - element
*/
AnimatedDrawable.pause = function(elem){
	elem.started = false;
};

/*
	Function: setAutoAnimated
	Set at true if the animation have to be played automaticaly (sequence playing continuously)
	
	Parameters: 
	elem - element
	value - boolean
*/
AnimatedDrawable.setAutoAnimated = function(elem, value){
	elem.auto = value;
};

/*
	Function: nextStep
	Advance the animation to the next part
	
	Parameters:
	elem - element
*/
AnimatedDrawable.nextStep = function(elem){
	elem.step = ++elem.step % elem.steps.length;
};

/*
	Function: playSequence
	Start playing a new sequence
	
	Parameters:
	seq - sequence id
	callback - called when sequence done or null
*/
AnimatedDrawable.playSequence = function(elem, seq, callback){
	if (elem.sequences == null) {
		if (DEBUG_MODE)
			console.error("Sequences have not been set for " + elem.imageName);
		return;
	}
	if (elem.sequences.length < seq){
		if(DEBUG_MODE)
			console.error("Sequence " + seq + " doesn't exist");
		return;
	}
	elem.started = true;
	elem.sequence = seq;
	elem.step = elem.sequences[seq][0];
	elem.sequenceCallback = callback;
	elem.auto = false;
};

/*
	Function: setSequence
	Permit to defined different sequences of animation inside a sprite
	
	Parameters:
	elem - element
	seq - [[0,2],[5,9],[3,4]]
*/
AnimatedDrawable.setSequences = function(elem, seq){
	elem.sequences = seq;
};

/*
	Class: ColorDrawable
	Inherits from:
	- <BaseElement>
	
	Draw rectangle colored extends BaseElement
*/
var ColorDrawable = BaseElement.extend({
	instanceName : "ColorDrawable",
	gradient : null,
	
	destuct : function(){
		this.base();
		delete this.corner;
		delete this.gradient;
	},
	
	/*
		Constructor: ColorDrawable
		Parameters:
		x - x pos
		y - y pos
		width - width
		height - height
		bgColor - background color
	*/
	constructor : function (x, y, width, height, bgColor){
		this.c = bgColor;
		this.base(x,y);
		this.baseWidth = width;
		this.baseHeight = height;
		this.width = width;
		this.height = height;
		this.scaledWidth = floor(this.width * this.scaling.x);
		this.scaledHeight = floor(this.height * this.scaling.y);
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		this.rightBound = this.x + width;
		this.bottomBound = this.y + height;
		this.boundingBox[2] = this.scaledWidth;
		this.boundingBox[3] = this.scaledHeight;
		this.corner = [];
		this.corner[0] = 0;
		this.corner[1] = 0;
		this.corner[2] = 0;
		this.corner[3] = 0;
		this.shape = 0;
		if (this.onReady) this.onReady();
	},

	/*
		Function: setShape
		Change the shape of the drawable :
		
		Parameters:
		shape - 0 = rect, 1 = elipse
	*/
	setShape : function(shape){
		this.shape = shape;
		if (shape == 1){
			this.boundingBox[0] = -this.scaledWidth;
			this.boundingBox[1] = -this.scaledHeight;
		}
	},
	
	/*
		Function: setCorners
		Add rounded corners
		
		Parameters:
		topLeft - top left corner
		topRight - top right corner
		bottomLeft - bottom left corner
		bottomRight - bottom right corner
	*/
	setCorners : function(topLeft, topRight, bottomLeft, bottomRight){
		this.corner[0] = topLeft;
		this.corner[1] = topRight;
		this.corner[2] = bottomLeft;
		this.corner[3] = bottomRight;
	},
			
	/*
		Function: setColor
		Parameters:
		r - red
		g - green
		b - blue
	*/
	setColor : function(r,g,b){
		this.c = c;
		this.gradient = null;
	},
	
	/*
		Function: setStroke
		Parameters:
		width - width
		strokeColor - stroke color
	*/
	setStroke : function(width, strokeColor){
		this.strokeColor = strokeColor;
		this.strokeWidth = width;
	},
	
	/*
		Function: draw
		Drawthis element
	*/
	draw : function(ec){
		if (!this.isVisible()) return;
		if (this.strokeColor){
			lineWidth(this.strokeWidth,ec);
			stroke(this.strokeColor.r,this.strokeColor.g,this.strokeColor.b, this.strokeColor.a,ec);
		}else{
			noStroke(ec);
		}
		if (this.c){
			fill(this.c,ec);
		}else if (this.gradient){
			if (!this.gradientDone){
				this.gradientParams = this.gradient;
				this.gradient = makeGradient(this.gradient);
				this.gradientDone = true;
			}
			fillGradient(this.gradient,ec);
		}
		if (this.shape == 0){
			rect(floor(this.x), floor(this.y), this.scaledWidth,this.scaledHeight,this.corner[0],this.corner[1],this.corner[2],this.corner[3],ec);
		}else{
			ellipse(floor(this.x) , floor(this.y),this.scaledWidth,this.scaledHeight,ec);
		}
	},
	
	/*
		Scale current element
		@param x : float value, 1 = original size
		@param y : float value, 1 = original size
		@param center : if true scale is centered, else scale is left corner based
	*/
	scale$3 : function(x, y, center){
		if (this.scaling == null) this.scaling = new Vector();
		if (x >= 0)
			this.scaling.x = x;
		if (y >= 0)
			this.scaling.y = y;
		if (center)
			this.scaling.z = 1;
		else
			this.scaling.z = 0;
		this.scaledWidth = floor(this.width * this.scaling.x);
		this.scaledHeight = floor(this.height * this.scaling.y);
		if (this.scaling.z == 1){
			this.x += this.translatedX - floor(this.scaledWidth * 0.5);
			this.y += this.translatedY - floor(this.scaledHeight * 0.5);
		}
		this.rightBound = this.x + this.scaledWidth;
		this.bottomBound = this.y + this.scaledHeight;
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
			
	/*
		Function: scale
		Scale current element
		
		Parameters:
		x - float value, 1 = original size
		y - float value, 1 = original size
		center - if true scale is centered, else scale is left corner based
	*/
	scale : function(){
		if (arguments.length == 2)
			this.scale$3(arguments[0],arguments[1],this.scaling.z);
		else
			this.scale$3(arguments[0],arguments[1],arguments[2]);
		if (this.gradient){
			this.gradientParams.endX = arguments[0];
			this.gradientParams.endY = arguments[1];
			this.gradient = this.gradientParams;
			this.gradientDone = false;
		}
	},
	
	/*
		Function fillGradient
		Fill this color drawable width a gradient made with makeGradient(x,y,width,height,colors) method
		
		Parameters:
		gadientParams -
		[{ 	col : color(r,g,b),
		
			stopPos : 0.x
			
		},{ 	col : color(r,g,b),
		
			stopPos : 0.x
			
		}]
		startX - optionnal
		startY - optionnal
		endX - optionnal
		endY - optionnal
	*/
	fillGradient : function(gradientParams, startX, startY, endX, endY){
		if (startX == undefined) startX = 0;
		if (startY == undefined) startY = 0;
		if (endX == undefined) endX = this.width;
		if (endY == undefined) endY = this.height;
		this.gradient = { "colors" : gradientParams, "startX" : startX, "startY" : startY, "endX" : endX, "endY" : endY};
		this.gradientParams = this.gradient;
		this.c = null;
		this.gradientDone = false;
	}
});

/*
	Class: UIDrawable
	Inherits from:
	- <BaseElement>
	
	A drawable suitable for UI
*/
var UIDrawable = BaseElement.extend({
	
	/*
		Constructor: 
		Parameters:
		x - x
		y - y
		width - width
		height - height
	*/
	constructor : function(x,y,width,height){
		this.base(x,y);
		this.baseWidth = width;
		this.baseHeight = height;
		this.width = width;
		this.height = height;
		this.scaledWidth = floor(this.width * this.scaling.x);
		this.scaledHeight = floor(this.height * this.scaling.y);
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		this.rightBound = this.x + width;
		this.bottomBound = this.y + height;
		this.boundingBox[2] = this.scaledWidth;
		this.boundingBox[3] = this.scaledHeight;
		this.ready = true;
		this.border = {};
		this.bg = {};
		this.padding = {};
		this.computed = { 
			'width' : width, 
			'height' : height, 
			srcX : 0,
			srcY : 0,
			srcWidth : width,
			srcHeight:  height,
			destX : 0,
			destY : 0,
			destWidth : width,
			destHeight : height
		}
		this.childs = [];
		this.overflow = UIDrawable.DISABLED;
		this.canvas = document.createElement('canvas');
		this.canvas.webkitImageSmoothingEnabled = true;
		this.canvas.mozImageSmoothingEnabled = true;
		this.canvas.height = this.height;
		this.canvas.width = this.width;
		this.context = this.canvas.getContext('2d');
	},
	
	/*
		Function: isReady
		Return true if ready (always ready by default)
	*/
	isReady : function(){
		if (this.ready) return true;
	},
	
	/*
		Function: draw
		
		Parameters:
		c - context where to draw
	*/
	draw : function(c){
		this.update();
		if (this.bg.g){
			fillGradient(this.bg.g,this.context);
		}else if (this.bg.c){
			fill(this.bg.c, this.context);
		}		
		
		rect(0, 0, this.width, this.height, this.border.tlr,this.border.trr,this.border.blr,this.border.brr, this.context);
		
		if (this.bg.imageName){
			if (this.bg.img && this.bg.img != -1){
				this.context.drawImage(this.bg.img,this.computed.srcX,this.computed.srcY,this.computed.srcWidth,this.computed.srcHeight,this.computed.destX,this.computed.destY, this.computed.destWidth, this.computed.destHeight);
			}else{
				this.bg.img = Library.get(this.bg.imageName);
			}
		}
		
		//Render childs
		var i = this.childs.length;
		if (!i) return;
		do{
			i--;
			var tmp = this.childs[0];
			if (tmp._area != this._area){
				this._area.addDrawable(this._zIndex, tmp);
				tmp._context = this.context;
			}
			if (tmp.beforeProcess)
				tmp.beforeProcess();
			if (tmp.enabled){
				if (this.context)
					tmp.draw(this.context);
				else
					tmp.draw(c);
			}
			if (tmp.enabled && tmp.afterProcess)
				tmp.afterProcess();
		}while(i);
		
		if (this.border.c){
			stroke(this.border.c,this.context);
			lineWidth(this.border.width,this.context);
		}
		fill(color(0,0,0,0),this.context);
		rect(0, 0, this.width, this.height, this.border.tlr,this.border.trr,this.border.blr,this.border.brr, this.context);
		
		c.drawImage(this.canvas,0,0,this.width,this.height,floor(this.x),floor(this.y),this.scaledWidth, this.scaledHeight);
		
	},
	
	/*
		Internal function
		Refresh computed values
	*/
	update : function(){
		if (this.bg.left >= 0)
			this.computed.srcX = 0;
		else
			this.computed.srcX = -this.bg.left;
		if (this.bg.top >= 0)
			this.computed.srcY = 0;
		else
			this.computed.srcY = -this.bg.top;
		this.computed.srcWidth = this.width;
		this.computed.srcHeight = this.height;
		if (this.bg.left >= 0)
			this.computed.destX = this.bg.left;
		else 
			this.computed.destX = 0;
		if (this.bg.top >= 0)
			this.computed.destY = this.bg.top;
		else
			this.computed.destY = 0;
		this.computed.destWidth = this.width;
		this.computed.destHeight = this.height;
	},
	
	/*
		Function: addBackgroundImage
		Add a background image to this element
		
		Parameters:
		img - image path
		top - top position
		left - left position
	*/
	addBackgroundImage : function(img, top, left){
		this.bg.imageName = img;
		if (this.imageName != ""){
			this.bg.img = Library.get(img);
			if (this.im == null){
				Library.addImage(img);
			}
		}
		this.bg.top = top;
		this.bg.left = left;
	},
	
	/*
		Function: removeBackgroundImage
		Remove current background image
		
		Parameters:
		
	*/
	removeBackgroundImage : function(){
		this.bg.img = null;
	},
	
	/*
		Function: addBackgroundColor
		Add a background color, based on rect shape (replace current gradient color)
		
		Parameters:
		c - color
	*/
	addBackgroundColor : function(c){
		this.bg.c = c;
		this.bg.g = null;
	},

	/*
		Function: removeBackgroundColor
		Remove current background color
		
		Parameters:
	*/
	removeBackgroundColor : function(){
		this.bg.c = null;
	},
	
	/*
		Function: addBackgroundGradient
		Add a background gradient (replace current background color)
		
		Parameters:
		g - gradient made with makeGradient
		tlr - optional : top left rounded radius
		trr - optional : top right rounded radius
		blr - optional : bottom left rounded radius
		brr - optional : bottom right rounded radius
	*/
	addBackgroundGradient : function(g, tlr, trr, blr, brr){
		this.bg.c = null;
		this.bg.g = g;
		this.border.tlr = tlr;
		this.border.trr = trr;
		this.border.blr = blr;
		this.border.brr = brr;
	},
	
	/*
		Function: removeBackgroundGradient
		Remove current background gradient
		
		Parameters:
	*/
	removeBackgroundGradient : function(){
		this.bg.g = null;
		
	},
	
	/*
		Function: addBorder
		Add border, based on rect shape
		
		Parameters:
		width - border width
		color - border color
		tlr - optional : top left rounded radius
		trr - optional : top right rounded radius
		blr - optional : bottom left rounded radius
		brr - optional : bottom right rounded radius
	*/
	addBorder : function(width, c, tlr, trr, blr, brr){
		this.border.width = width;
		this.border.c = c;
		this.border.tlr = tlr;
		this.border.trr = trr;
		this.border.blr = blr;
		this.border.brr = brr;
	},
	
	/*
		Function: removeBorder
		Remove current border
	*/
	removeBorder : function(){
		this.border = {};
	},
	
	/*
		Function: setOverflowHidden
		Set overflow behavior
		
		Parameters:
		behavior - UIDrawable.HIDDEN, UIDrawable.SCROLL, UIDrawable.DISABLED (default)
	*/
	setOverflowBehavior : function(behavior){
		this.overflow = behavior;
	},
	
	/*
		Function: addChild
		Add a child element wich will be draw relatively to this element
		
		Parameters:
		child - child element
	*/
	addChild : function(child){
		this.childs.push(child);
		if (this._area){
			this._area.addDrawable(this._zIndex, child);
			child._ui = true;
		}
	},
	
	/*
		Scale current element
		@param x : float value, 1 = original size
		@param y : float value, 1 = original size
		@param center : if true scale is centered, else scale is left corner based
	*/
	scale$3 : function(x, y, center){
		if (this.scaling == null) this.scaling = new Vector();
		if (x >= 0)
			this.scaling.x = x;
		if (y >= 0)
			this.scaling.y = y;
		if (center)
			this.scaling.z = 1;
		else
			this.scaling.z = 0;
		this.scaledWidth = floor(this.canvas.width * this.scaling.x);
		this.scaledHeight = floor(this.canvas.height * this.scaling.y);
		if (this.scaling.z){
			this.x += this.translatedX - floor(this.scaledWidth * 0.5);
			this.y += this.translatedY - floor(this.scaledHeight * 0.5);
		}
		this.rightBound = this.x + this.scaledWidth;
		this.bottomBound = this.y + this.scaledHeight;
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
	
	
	/*
		Function: scale
		Parameters:
		x - x pos
		y - y pos
		centered - optional
	*/
	scale : function(){
		if(arguments.length == 2){
			this.scale$3(arguments[0],arguments[1],this.scaling.z);
		}else{
			this.scale$3.apply(this,arguments);
		}
	}
});

UIDrawable.HIDDEN = 0;
UIDrawable.SCROLL = 1;
UIDrawable.DISABLED = 2;

/*
	Class: TouchDrawable
	Inherits from:
	- <BaseElement>
	
	A drawable movable by touch or click
*/
var TouchDrawable = BaseElement.extend({

	/*
		Constructor: TouchDrawable
		Parameters:
		x - x pos
		y - y pos
		width - width
		height - height
	*/
	constructor : function(x,y,width,height){
		this.base(x,y);
		this.baseWidth = width;
		this.baseHeight = height;
		this.width = width;
		this.height = height;
		this.scaledWidth = floor(this.width * this.scaling.x);
		this.scaledHeight = floor(this.height * this.scaling.y);
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		this.rightBound = this.x + width;
		this.bottomBound = this.y + height;
		this.boundingBox[2] = this.scaledWidth;
		this.boundingBox[3] = this.scaledHeight;
		this.mouseMove = false;
		this.drawing = [];
		this.lineWidth = 7;
		if (this.onReady) this.onReady();
		this.c = color(0,0,0);
	},
	
	/*
		Function: onMouseDown
	*/
	onMouseDown : function(){
		this.mouseMove = true;
		if (this.drawing.length == 0){
			this.drawing[0] = [];
			this.drawing[0][0] = {x : mouseX, y : mouseY};
		}else{
			this.drawing[this.drawing.length] = [];
			this.drawing[this.drawing.length-1][0] = {x : mouseX, y : mouseY};
		}
	},
	
	/*
		Function: mouseEnter
		Override if needed
	*/
	mouseEnter : function(){},
	
	/*
		Function: mouseLeave
		Override if needed
	*/
	mouseLeave : function(){},
	
	/*
		Function: mouseOver
	*/
	mouseOver : function(){
		if (this.mouseMove){
			var x = this.drawing[this.drawing.length - 1][this.drawing[this.drawing.length - 1].length - 1].x;
			var y = this.drawing[this.drawing.length - 1][this.drawing[this.drawing.length - 1].length - 1].y;
			if (mouseX == x && mouseY == y)
				return;
			else if (mouseY == y && this.drawing[this.drawing.length - 1].length != 1)
				this.drawing[this.drawing.length - 1][this.drawing[this.drawing.length - 1].length - 1].x = mouseX;
			else if (mouseX == x && this.drawing[this.drawing.length - 1].length != 1)
				this.drawing[this.drawing.length - 1][this.drawing[this.drawing.length - 1].length - 1].y = mouseY;
			else{
				this.drawing[this.drawing.length - 1][this.drawing[this.drawing.length - 1].length] = { 'x' : mouseX, 'y' : mouseY};
			}
		}
	},

	/*
		Function: onMouseUp
	*/
	onMouseUp : function(){
		this.mouseMove = false;
	},
	
	/*
		Function: draw
		
		Parameters:
		c - context where to draw
	*/
	draw : function(ec){
		var i = this.drawing.length;
		if (i <= 0) return;
		lineWidth(this.lineWidth);
		do {
			var j = this.drawing[--i].length - 1;
			if (j<=0) continue;
			do{
				fill(this.c.r,this.c.g,this.c.b,ec);
				line(this.drawing[i][j].x,this.drawing[i][j].y, this.drawing[i][--j].x,this.drawing[i][j].y,ec);
			}while(j);
		}while(i);
	},
	
	/*
		Scale current element
		@param x : float value, 1 = original size
		@param y : float value, 1 = original size
		@param center : if true scale is centered, else scale is left corner based
	*/
	scale$3 : function(x, y, center){
		if (this.scaling == null) this.scaling = new Vector();
		if (x >= 0)
			this.scaling.x = x;
		if (y >= 0)
			this.scaling.y = y;
		if (center)
			this.scaling.z = 1;
		else
			this.scaling.z = 0;
		if (this.im == undefined) return;
		this.scaledWidth = floor(this.im.width * this.scaling.x);
		this.scaledHeight = floor(this.im.height * this.scaling.y);
		if (this.scaling.z){
			this.x += this.translatedX - floor(this.scaledWidth * 0.5);
			this.y += this.translatedY - floor(this.scaledHeight * 0.5);
		}
		this.rightBound = this.x + this.scaledWidth;
		this.bottomBound = this.y + this.scaledHeight;
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
	
	
	/*
		Function: scale
		Parameters:
		x - x percent, 1 = original size
		y - y percent, 1 = original size
		centered - optional
	*/
	scale : function(){
		if(arguments.length == 2){
			this.scale$3(arguments[0],arguments[1],this.scaling.z);
		}else{
			this.scale$3.apply(this,arguments);
		}
	}
	
});

/*
	Class: BufferedDrawable
	Inherits from:
	- <Drawable>
	
	As a drawable but with a direct access to bufferised pixels
*/
var BufferedDrawable = Drawable.extend({
	instanceName : "BufferedDrawable",
	
	/*
		Variable: pixels
		Array of pixels
	*/
	
	/*
		Constructor: BufferedDrawable
		Parameters:
		x - x pos
		y - y pos
		path - image path
	*/
	constructor : function(x, y, path){
		this.base(x,y,path);
		this.pixels = [];
	},
	
	/*
		Function: isReady
	*/
	isReady : function(){
		if (this.ready) return true;
		if (this.base()){
			var tmp = document.createElement('canvas');
			tmp.webkitImageSmoothingEnabled = true;
			tmp.mozImageSmoothingEnabled = true;
			tmp.height = this.height;
			tmp.width = this.width;
			this.context = tmp.getContext('2d');
			this.context.drawImage(this.im,0,0,this.width,this.height,0,0,this.width, this.height);
			this.pixels = this.context.getImageData(0, 0, this.width, this.height);
			this.im = tmp;
			return true;
		}
		return false;
	},
	
	/*
		Function: update
		Call update when modifying pixels array
	*/
	update : function(){
		this.context.putImageData(this.pixels,0,0);
	},
	
	/*
		Function: setPixel
		Parameters:
		x -  x pos
		y -  y pos
		c - color array [red, green, blue]
	*/
	setPixel : function(x,y,c){
		var tmp = x * this.width * 3 + y * 3;
		if (tmp + 2 < this.pixels.length){
			this.pixels[tmp] = c.r;
			this.pixels[tmp + 1] = c.g;
			this.pixels[tmp + 2] = c.b;
		}
	},
	
	/*
		Function: getPixel
		Parameters:
		x - x pos
		y - x pos
	*/
	getPixel : function(x,y){
		var tmp = x * this.width * 3 + y * 3;
		if (tmp + 2 < this.pixels.length){
			return color(this.pixels[tmp],this.pixels[tmp + 1],this.pixels[tmp + 2]);
		}
		return -1;
	},
	
	/*
		Function: getPixels
	*/
	getPixels : function(){
		var res = [];
		for (var i = 0; i < this.pixels.data.length; i++){
			res[i] = this.pixels.data[i];
		}
		return res;
	},
	
	/*
		Function: setPixels
		Parameters:
		p - pixels array, must have same size as member variable pixels
	*/
	setPixels : function(p){
		if (p.length != this.pixels.data.length) return;
		for (var i =0; i < p.length; i++){
			this.pixels.data[i] = p[i];
		}
	},
	
	/*
		Function: scale
		
		Resize a buffered drawable by manipulating pixels
		
		Parameters:
		x - x percent,1 = original size
		y - y percent,1 = original size
	*/
	scale : function(x,y){
		this.scaling.x = x;
		this.scaling.y = y;
		var tmp = document.createElement('canvas');
		tmp.webkitImageSmoothingEnabled = true;
		tmp.mozImageSmoothingEnabled = true;
		tmp.height = this.height;
		tmp.width = this.width;
		this.context = tmp.getContext('2d');
		this.context.drawImage(this.im,0,0,this.width,this.height,0,0,this.width * x, this.height * y);
		this.pixels = this.context.getImageData(0, 0, this.width, this.height);
		this.im = tmp;
		
		this.width = this.width * x;
		this.height = this.height * y;
		this.scaledWidth = this.width;
		this.scaledHeight = this.height;
		
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
	
	/*
		Function: crop
		Crop a buffered drawable
		Parameters:
		x - top left x pos
		y - top left y pos
		w - width
		h - height
	*/
	crop : function(x,y,w,h){
		var tmp = document.createElement('canvas');
		tmp.webkitImageSmoothingEnabled = true;
		tmp.mozImageSmoothingEnabled = true;
		tmp.width = w;
		tmp.height = h;
		this.context = tmp.getContext('2d');
		this.context.drawImage(this.im,x,y,w,h,0,0,w,h);
		this.pixels = this.context.getImageData(0, 0, w, h);
		this.im = tmp;
		
		this.width = w;
		this.height = h;
		this.scaledWidth = this.width;
		this.scaledHeight = this.height;
		this.scaling.x = 1;
		this.scaling.y = 1;
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
	
	/*
		Function: enlarge
		Enlarge this buffered drawable by a width and height
		
		Parameters:
		w - number of pixel to add in width
		h - number of pixel to add in height
		bgColor - color of added pixel 
		centered - add the same amout of pixel in each direction (w/2 and h/2)
	*/
	enlarge: function(w,h,bgColor, centered){
		var tmp = document.createElement('canvas');
		tmp.webkitImageSmoothingEnabled = true;
		tmp.mozImageSmoothingEnabled = true;
		tmp.width = this.width + w;
		tmp.height = this.height + h;
		this.context = tmp.getContext('2d');
		fill(bgColor.r, bgColor.g, bgColor.b, bgColor.a);
		this.context.fillRect(0,0,w,h);
		noFill();
		if (centered)
			this.context.drawImage(this.im, 0,0,this.width,this.height,w * 0.5,h * 0.5, this.width,this.height);
		else
			this.context.drawImage(this.im,0,0,this.width,this.height,0,0,this.width,this.height);
		this.width += w;
		this.height += h;
		this.pixels = this.context.getImageData(0, 0, this.width, this.height);
		this.im = tmp;
		
		this.scaledWidth = this.width;
		this.scaledHeight = this.height;
		this.scaling.x = 1;
		this.scaling.y = 1;
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	}
});

/*
	Class: VideoDrawable
	Offer a way to display video
*/
var VideoDrawable = BaseElement.extend({
	instanceName : "VideoDrawable",
	
	/*
		Constructor: VideoDrawable
		
		Parameters:
		x - x pos
		y - y pos
		path - path to the video without extension
		width - video width
		height - video height
	*/
	constructor: function(x, y, path, width, height){
		this.base(x,y);
		this.video = document.createElement('video');
		if (window.canPlayMP3){
			this.video.src = path + '.mp4';
		}else{
			this.video.src = path + '.ogv';
		}
		this.width = floor(width);
		this.height = floor(height);
		if (this.scaling.x != 1) this.width *= this.scaling.x;
		if (this.scaling.y != 1) this.height *= this.scaling.y;
		this.rightBound = this.x + this.width;
		this.bottomBound = this.y + this.height;
		this.translatedX = floor(this.width * 0.5);
		this.translatedY = floor(this.height * 0.5);
		this.scaledWidth = floor(this.width);
		this.scaledHeight = floor(this.height);
		this.ready = true;
		if (this.boundingBox[2] == 0 && this.boundingBox[3] == 0){
			this.boundingBox[2] = floor(this.scaledWidth);
			this.boundingBox[3] = floor(this.scaledHeight);
		}
		if (this.onReady) this.onReady();
	},
		
	/*
		Function: draw
		
		Parameters:
		ec - context where to draw
	*/
	draw : function(ec){
		ec.drawImage(this.video,0,0,this.width,this.height,floor(this.x),floor(this.y),this.scaledWidth, this.scaledHeight);
	},
	
	/*
		Function: play
	*/
	play: function(){
		this.video.play();
	},
	
	/*
		Function: paused
		Return a boolean
	*/
	paused : function(){
		return this.video.paused;
	},
	
	/*
		Function: pause
	*/
	pause : function(){
		this.video.pause();
	},
	
	/*
		Function: loop
		Parameters:
		loop- boolean
	*/
	loop : function(loop){
		this.video.loop = loop;
	},
	
	/*
		Scale current element
		@param x : float value, 1 = original size
		@param y : float value, 1 = original size
		@param center : if true scale is centered, else scale is left corner based
	*/
	scale$3 : function(x, y, center){
		if (this.scaling == null) this.scaling = new Vector();
		if (x >= 0)
			this.scaling.x = x;
		if (y >= 0)
			this.scaling.y = y;
		if (center)
			this.scaling.z = 1;
		else
			this.scaling.z = 0;
		if (this.video == undefined) return;
		this.scaledWidth = floor(this.width * this.scaling.x);
		this.scaledHeight = floor(this.height * this.scaling.y);
		if (this.scaling.z){
			this.x += this.translatedX - floor(this.scaledWidth * 0.5);
			this.y += this.translatedY - floor(this.scaledHeight * 0.5);
		}
		this.rightBound = this.x + this.scaledWidth;
		this.bottomBound = this.y + this.scaledHeight;
		this.translatedX = floor(this.scaledWidth * 0.5);
		this.translatedY = floor(this.scaledHeight * 0.5);
		if (this.boundingBox[4] == BaseElement.RECT){
			this.boundingBox[2] = this.scaledWidth;
			this.boundingBox[3] = this.scaledHeight;
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			if (!this.boundingBox[1])
				this.boundingBox[1] = this.boundingBox[0];
			this.boundingBox[0] = this.boundingBox[1] * this.scaling.x;
		}
	},
	
	
	/*
		Function: scale
		Parameters:
		x - x pos
		y - y pos
		centered - optional
	*/
	scale : function(){
		if(arguments.length == 2){
			this.scale$3(arguments[0],arguments[1],this.scaling.z);
		}else{
			this.scale$3.apply(this,arguments);
		}
	}
	
});
/*
	Class: Entity
	Inherits from:
	- <AnimatedDrawable>
	
	An entity can be a character, a monster or anything wich need to have "pseudo-intelligence"
	This is the base class, you have to use DrawableEntity or AnimatedDrawableEntity
	extends AnimatedDrawable
*/
var Entity = AnimatedDrawable.extend({
	
	destruct : function(){
		this.base();
		delete this.checkPoint;
	},
	
	/*
		Constructor: Entity
		Parameters:
		x - x pos
		y - y pos
		imName - image name
		sWidth - sprite width
		sHeight - sprite height
		sSpeed - animation speed
	*/
	constructor : function(x, y, imName, sWidth, sHeight, sSpeed) {
		if (sWidth == undefined)
			this.base(x,y,imName,0, 0, 0);
		else
			this.base(x,y,imName,sWidth, sHeight, sSpeed);
		this.instanceName = "Entity";
		this.checkPoint = null;
		this.checkPointState = 0;
		this.checkPointEnabled = true;
		this.moveSpeed = null;
	},

	/*
		Function: onCheckPointDone
		Can override, this function is called when the checkPointState come back to 0
	*/
	onCheckPointDone : function (){},
	
	/*
		Function: draw
		Parameters:
		ec - context to draw
	*/
	draw : function(ec){
		if (this.checkPoint != null && this.checkPointEnabled){
			if (Functions.pointInSquare(this.checkPoint[this.checkPointState].x,this.checkPoint[this.checkPointState].y,this.x,this.y,this.scaledWidth,this.scaledHeight)){
				this.checkPointState = ++this.checkPointState;
				if (this.checkPointState >= this.checkPoint.length){
					this.checkPointState = 0;
					this.onCheckPointDone();
				}
				if (this.baseSpeed)
					this.moveSpeed = this.baseSpeed;
				else
					this.moveSpeed = Math.max(this.checkPoint[this.checkPointState].x,this.checkPoint[this.checkPointState].y) * 2;
			}
			BaseElement.advanceBy(this, this.checkPoint[this.checkPointState].x - this.x - this.translatedX, this.checkPoint[this.checkPointState].y - this.y - this.translatedY, this.moveSpeed);
			this.moveSpeed -= Engine.__renderSpeed;
		}
		this.base(ec);
	},
	
	/*
		Function: move
		Move to a direction (LEFT, TOP, DOWN, RIGHT),
		each call to this method reset the previous movement
		
		Parameters:
		dir - direction (LEFT, TOP, DOWN, RIGHT)
		off - offset (int)
		speed - time (in ms) to reach new (x,y) computed position
	*/
	move : function (offX, offY, moveSpeed){
		BaseElement.advanceBy(this,offX, offY, moveSpeed);
	},
	
	/*
		Function: setCheckPoint
		Define a path followed by the Entity
		
		Parameters:
		points - an array of checkPoint
		speed - if undefined linear speed taken
	*/
	setCheckPoint : function (points,speed){
		this.checkPoint = points;
		if (speed){
			this.moveSpeed = speed;
			this.baseSpeed = speed;
		}
	},
	
	/*
		Function: stopped
		Return true if the entity is stopped
	*/
	stopped : function (){
		return this.checkPointEnabled == false;
	},
	
	/*
		Function: setSpeed
		Set current speed
		
		Parameters:
		s - speed
	*/
	setSpeed : function(s){
		this.baseSpeed = s;
		this.moveSpeed = s;
	},
	
	/*	
		Function: stopCheckPoint
		Stop an entity
	*/
	stopCheckPoint : function (){
		this.checkPointEnabled = false;
		BaseElement.stop(this);
	},
	
	/*
		Function: restartCheckPoint
		Restart a stopped entity
	*/
	restartCheckPoint : function (){
		this.checkPointEnabled = true;
	}
});

/*
	Class: SharedEntity
	Inherits from:
	- <Entity>
	
	An entity shared over the network with all others players in a same Room
	Generaly used for the player
	Use an instance of SharedEntityManager to automaticaly manage entity of the others player in the room
	extends Entity
*/
var SharedEntity = Entity.extend({	

	/*
		Constructor: SharedEntity
		Parameters:
		x - x pos
		y - y pos
		imName - image name
		sWidth - sprite width
		shared - sprite height
		sSpeed - animation speed
		r - network room
	*/
	constructor : function(x, y, imName, sWidth, sHeight, sSpeed, r){
		this.instanceName = "SharedEntity";
		this.room;
		this.base(x, y, imName, sWidth, sHeight, sSpeed);
	},
	
	/*
		Function: move
		Move an entity and dispatch the message over the network
		
		Parameters:
		dir - direction
		off - offset
		speed - speed
	*/
	move : function(dir, off, speed){
		r.sendMessage('entity','{\'id\':' + this.room.getUniqueId() + ',\'move:\' : [' + dir + ',' + off  + ',' + speed + ']}');
		this.base(dir, off, speed);
	}
	
});

/*  %TODO%
	A manager wich provide a way to instanciate, update, delete automaticaly the entity shared in the room
class SharedEntityManager{
	
	protected Room room;
	protected Area area;
	
	SharedEntityManager(Room r, Area a){
		this.room = r;
		
	}
	
}
*/

/*
	Class: PhysicEntity
	Inherits from:
	- <Entity>
	
	An entity provided with some physicals interaction (interact only with other PhysicEntity)
	PhysicEntity fire some function before drawing :
		onTouch : when touching something
		onBlock : when acceleration is not high enough to move and touching something
		onFly : when no hit no block
	extends Entity
*/
var PhysicEntity = Entity.extend({
	destruct : function(){
		this.base();
		delete this.hit;	
	},
	
	/*
		Constructor: PhysicEntity
		Parameters:
		x - x pos
		y - y pos
		weight - weight
		imName - image name
		sWidth - sprite width
		shared - sprite height
		sSpeed - animation speed
	*/
	constructor : function (x, y, weight, imName, sWidth, sHeight, sSpeed){
		if (sWidth == undefined)
			this.base(x,y,imName,0,0,0);
		else if (!imName  || imName == "")
			this.base(x,y,"",0,0,0);
		else
			this.base(x,y,imName,sWidth,sHeight,sSpeed);
		this.width = sWidth;
		this.height = sHeight;
		this.instanceName = "PhysicEntity";
		this.weight = 0;
		this.fpsWeight = 0;
		this.fps2Weight = 0;
		this.absorption = 0.75;
		this.dir = new Vector(0,1);
		this.acceleration = new Vector(0,0);
		this.hit = {br : false, tl : false, tr : false, bl : false, blocked : false, x : 0, y : 0};
		this.weight = weight;
		this.fpsWeight = weight * 0.033333;
		this.fps2Weight = weight * 0.066666;
		this.rightBound = this.x + this.width;
		this.bottomBound = this.y + this.height;
	},
	
	/*
		Function: draw
	*/
	draw : function(ec){
		if (this.imageName != ""){
			this.base(ec);
		}else{
			if (DEBUG_MODE){
				noFill(ec);
				stroke(0,0,0);
				rect(0,0,this.width,this.height);
			}
		}
	},
	
	/*
		Function: isReady
	*/
	isReady : function(){
		if (this.imageName != ""){
			return this.base();
		}
		return true;
	},
	
	/*
		Function: changeAbsorption
		Parameters:
		absorption - absorption value 0 to 2
	*/
	changeAbsorption : function(absorption){
		this.absorption = absorption;
	},
	
	
	/*	
		Function: onBlock
		Can override, fired when acceleration is not high enough to move and touching something
	*/
	onBlock : function(){},
	
	/*
		Function: onTouch
		Can override, fired when touching something
		Parameters:
		physicsEntity - physicsEntity
	*/
	onTouch : function(physicsEntity){},
	
	/*
		Function: onFly
		Can override, fired when no hit and no block
	*/
	onFly : function(){},
	
	/*
		Function: move
		Add acceleration to current acceleration and change direction
	*/
	move : function(dirX, dirY, accX, accY){
		if (accX > this.weight * this.absorption || accY > this.weight * this.absorption){
			this.dir.set(dirX, dirY);
			this.dir.normalize();
			this.acceleration.add(accX, accY);
			this.hit.blocked = false;
		}
	},
	
	/*
		Function: strike
		Like move but apply absorption on the acceleration
		
		Parameters:
		dirX - direction in x
		dirY - direction in y
		accX - acceleration in x
		accY - acceleration in y
	*/
	strike : function(dirX, dirY, accX, accY){
		this.move(dirX, dirY, accX * this.absorption, accY * this.absorption);
	},
	
	/*
		Function: interact
		Compute interaction force with the world and between entities 
		
		Parameters:
		physicsEntity - entity
	*/
	interact : function(e){
		var hitE = false;
		/* Compute next pos and bound */
		var tmpPos = new Vector(this.dir.x * this.acceleration.x + this.x, this.dir.y * this.acceleration.y +  this.y);
		var tmpBound = new Vector(this.width + tmpPos.x, this.height + tmpPos.y);
	
		/* Find hit parts */
		if (Functions.pointInSquare(tmpBound.x,tmpBound.y,e.x, e.y, e.width, e.height)){	/* bottom right*/
			this.hit.br = true;
			hitE = true;
		}
		if (Functions.pointInSquare(tmpPos.x,tmpPos.y,e.x, e.y, e.width, e.height)){ 		/* top left */
			this.hit.tl = true;
			hitE = true;
		}
		if (Functions.pointInSquare(tmpBound.x, tmpPos.y, e.x, e.y, e.width, e.height)){ 	/* top right */
			this.hit.tr = true;
			hitE = true;
		}
		if (Functions.pointInSquare(tmpPos.x,tmpBound.y,e.x, e.y, e.width, e.height)){ 		/* bottom left */
			this.hit.bl = true;
			hitE = true;
		}
		
		if (hitE && !this.hit.blocked && this.weight != 0 && e.weight != 0 && (this.acceleration.x > e.fps2Weight || this.acceleration.y > e.fps2Weight )){
			e.strike(this.dir.x - 1,this.dir.y, this.acceleration.x * this.absorption, this.acceleration.y * this.absorption);
		}
		
	},
	
	/*
		Function: beforeProcess
		Before process we apply the effects of forces on the instance
	*/
	beforeProcess : function(){
		/* Compute direction changements */
		if ((this.hit.br && this.hit.bl) || (this.hit.tl && this.hit.tr))   {
			this.dir.y = -this.dir.y;
		}else if ((this.hit.br && this.hit.tr) || (this.hit.tl && this.hit.bl)){
			this.dir.x = -this.dir.x;
		}else if (this.hit.br){
			if (this.dir.x > 0) this.dir.x = -this.dir.x;
			if (this.dir.y > 0) this.dir.y = -this.dir.y;
		}else if (this.hit.bl){
			if (this.dir.x < 0) this.dir.x = -this.dir.x;
			if (this.dir.y > 0) this.dir.y = -this.dir.y;
		}else if (this.hit.tr){
			if (this.dir.x > 0) this.dir.x = -this.dir.x;
			if (this.dir.y < 0) this.dir.y = -this.dir.y;
		}else if (this.hit.tl){
			if (this.dir.x < 0) this.dir.x = -this.dir.x;
			if (this.dir.y < 0) this.dir.y = -this.dir.y;
		}
		
		if (this.hit.bl && this.hit.br && this.acceleration.y < this.weight * this.absorption && this.acceleration.x < this.weight * this.absorption){
			this.hit.blocked = true;
		}
		
		if (!this.hit.blocked && (this.hit.bl || this.hit.br || this.hit.tl || this.hit.tr)) this.acceleration.mult(this.absorption);
		
		if (this.weight > 0 && !this.hit.blocked){
			/* Change position */
			this.setPos(this.dir.x * this.acceleration.x + this.x, this.dir.y * this.acceleration.y +  this.y);
			
			/* Compute next acceleration */
			if (this.dir.y >= 0){
				this.acceleration.y += this.fpsWeight;
			}else if (this.acceleration.y - this.fps2Weight >= this.fps2Weight)   {
				this.acceleration.y -= this.fps2Weight;
			}else{
				this.dir.y = -this.dir.y;
			}
			if (this.acceleration.x - this.fps2Weight >= this.fpsWeight)
					this.acceleration.x -= this.fpsWeight;
		}
		if (this.acceleration.x > this.translatedX) this.acceleration.x = this.translatedX;
		if (this.acceleration.y > this.translatedY) this.acceleration.y = this.translatedY;
		this.hit.bl = false;
		this.hit.br = false;
		this.hit.tl = false;
		this.hit.tr = false;
	}
	
});
/*	Simple Button class	extends ColorDrawable implements ClickHandler, MouseOverHandler */var SimpleButton = ColorDrawable.extend({		/*		Constructor:		Parameters:		x - x position		y - y position		width - width		height - height		backgroundColor - background color		textColor - text color		curentText - curentText to draw		callback - callback to call when button is clicked	*/	constructor : function(x, y, width, height, backgroundColor, textColor, curentText, callback){		this.base(x,y,width,height,backgroundColor);		this.instanceName = "SimpleButton";		this.defaultSize = 12;		this.textColor = textColor;		this.clickCallback = callback;		this.curentText = curentText;		if (this.width >= this.height){			this.setCorners(height * 0.2, height * 0.2, height * 0.2, height * 0.2);		}else{			this.setCorners(width * 0.2, width * 0.2, width * 0.2, width * 0.2);		}		this.enterEnabled = false;	},		/*		Function: enableReturn		Enable validation with return key	*/	enableReturn : function(){		this.enterEnabled = true;	},		/* 		Function: disableReturn		Disable validation with return key	*/ 	disableReturn : function(){		this.enterEnabled = true;	},		/*		Function: mouseDown		Override if needed	*/	mouseDown : function(){},		/*		Function: mouseUp		Default mouseUp behavior	*/	mouseUp : function(){		if (!this.enabled || !this.isVisible()) return;		this.clickCallback.apply(this);	},	/*		Function: draw		Parameters:		ec - context where to draw				extend if needed	*/	draw : function(ec){		if (!this.visible) return;		if (this.enterEnabled){			if (Input.keysDown[KEY_RETURN]) this.onClick();		}		this.base();		noStroke();		textSize(this.defaultSize);		fill(this.textColor);		text(this.curentText, this.x + (this.width - textWidth(this.curentText)) * 0.5, this.y + (this.height + this.defaultSize) * 0.5);		if (this.c){			stroke(this.c.r * 0.2, this.c.g * 0.2,this.c.b * 0.2,1);		}	},		/*		Function: setTextSize		Parameters:		s - size (number)				Change text size	*/	setTextSize : function(s){		this.defaultSize = s;	},		/*		Function: mouseEnter		Default mouseEnter behavior	*/	mouseEnter : function(){			if (!this.enabled || !this.isVisible()) return;		Input.setCursor('pointer');	},		/*		Function: mouseLeave		Default mouseLeave behavior	*/	mouseLeave : function(){		if (!this.enabled || !this.isVisible()) return;		Input.setCursor('default');	},		/*		Function: mouseOver		Override if needed	*/	mouseOver : function(){	}});/*	ImageButton class	extends Drawable implements ClickHandler, MouseOverHandler*/var ImageButton = Drawable.extend({ 	/*		Constructor:		Parameters:		x - x position		y - y position		path - path to the image		callback - callback to call when button is clicked		tooltip - text to display when mouse is over	*/	constructor : function(x, y, path, callback, tooltip){		this.base(x,y,path);		this.instanceName = "ImageButton";		this.tooltipEnabled  = false;		this.clickCallback = callback;		this.tooltip = null;		if (tooltip != undefined){			this.tooltip = tooltip;		}		this.enterEnabled = false;	},	/*		Function: enableReturn		Enable validation with return key	*/	enableReturn : function(){		this.enterEnabled = true;	},		/*		Function: disableReturn		Enable validation with return key	*/	disableReturn : function(){		this.enterEnabled = true;	},		/*		Function: mouseUp		Default mouseUp behavior	*/	mouseUp : function(){		if (!this.enabled || !this.isVisible()) return;		this.clickCallback.apply(this);			},		/*		Function: mouseDown		Override if needed	*/	mouseDown : function(){	},	/*		Function: afterProcess		extend if needed	*/	afterProcess : function(){		if (this.enterEnabled){			if (Input.keysDown[KEY_RETURN]) this.onClick();		}		if (this.tooltipEnabled){			stroke(255,255,255);			fill(0,0,0);			var w = textWidth(this.tooltip);			var win = window;			if (win.mouseX + w > Engine.width){				lineWidth(1);				rect(win.mouseX - w ,win.mouseY - 30,w + 20,20, 5);								noStroke();				fill(255,255,255);				text(this.tooltip, win.mouseX - w + 10, win.mouseY - 15);			}else{				lineWidth(1);				rect(win.mouseX - w * 0.5 - 10, win.mouseY - 30,w + 20,20, 5);				noStroke();				fill(255,255,255);				text(this.tooltip, win.mouseX - w * 0.5, win.mouseY - 15);			}		}	},		/*		Function: mouseEnter		Default mouseEnter behavior	*/	mouseEnter : function(){		if (!this.enabled || !this.isVisible()) return;		Input.setCursor('pointer');		if (this.tooltip != null){			this.tooltipEnabled = true;		}	},		/*		Function: mouseLeave		Default mouseLeave behavior	*/	mouseLeave : function(){		if (!this.enabled || !this.isVisible()) return;		this.tooltipEnabled = false;		Input.setCursor('default');	},		/*		Function: mouseOver		Override if needed	*/	mouseOver : function(){	}});/*	ImageTextButton class	extends Drawable implements ClickHandler, MouseOverHandler*/var ImageTextButton = Drawable.extend({ 		/*		Constructor:		Parameters:		x - x position		y - y position		path - path to the image		textColor - text color		curentText - curentText to draw		callback - callback to call when button is clicked	*/	constructor : function(x, y, path, textColor, curentText, callback){		this.base(x,y,path);		this.instanceName = "ImageButton";		this.tooltipEnabled  = false;		this.path = path;		this.clickCallback = callback;		this.textColor = textColor;		this.curentText = curentText;		this.defaultSize = 12;		this.enterEnabled = false;	},	/* 		Function: enableReturn		Enable validation with return key	*/	enableReturn : function(){		this.enterEnabled = true;	},		/* 		Function: enableReturn		Disable validation with return key	*/ 	disableReturn : function(){		this.enterEnabled = true;	},		/*		Function: setRollover		Parameters:		img - drawable				Roll over image	*/	setRollover : function(img){		this.pathRollover = img;	},		/*		Function: mouseUp		Default mouseUp behavior	*/	mouseUp : function(){		if (!this.enabled || !this.isVisible()) return;		this.clickCallback.apply(this);			},		/*		Function: mouseDown		Override if needed	*/	mouseDown : function(){	},		/*		Function: draw		Parameters:		ec - context where to draw	*/	draw : function(ec){		if (this.enterEnabled){			if (Input.keysDown[KEY_RETURN]) this.onClick();		}		this.base();		if(this.visible){			noStroke();			textSize(this.defaultSize);			fill(this.textColor.r,this.textColor.g,this.textColor.b);			text(this.curentText, this.x + (this.width - textWidth(this.curentText)) * 0.5, this.y + (this.height + this.defaultSize) * 0.5);		}	},		/*		Function: mouseEnter		Default mouseEnter behavior	*/	mouseEnter : function(){		if (!this.enabled || !this.isVisible()) return;		Input.setCursor('pointer');		if(this.pathRollover){			Drawable.changeImage(this, this.pathRollover);				}	},		/*		Function: mouseLeave		Default mouseLeave behavior	*/	mouseLeave : function(){		if (!this.enabled || !this.isVisible()) return;		Input.setCursor('default');		if(this.pathRollover){			Drawable.changeImage(this, this.path);				}	},		/*		Function: mouseOver		Override if needed	*/	mouseOver : function(){	}});/*	ImageButton class	extends Drawable implements ClickHandler, MouseOverHandler*/var ImageButton = Drawable.extend({ 	/*		Constructor:		Parameters:		x - x position		y - y position		path - path to an image		callback - callback on click		tooltip - tooltip displayed on mouse over	*/	constructor : function(x, y, path, callback, tooltip){		this.base(x,y,path);		this.instanceName = "ImageButton";		this.tooltipEnabled  = false;		this.clickCallback = callback;		this.tooltip = null;		if (tooltip != undefined){			this.tooltip = tooltip;		}		this.enterEnabled = false;	},	/*		Function: enableReturn		Enable validation with return key	*/	enableReturn : function(){		this.enterEnabled = true;	},		/* 		Function: disableReturn		Disable validation with return key	*/ 	disableReturn : function(){		this.enterEnabled = true;	},		/*		Function: mouseUp		Default mouseUp behavior	*/	mouseUp : function(){		if (!this.enabled || !this.isVisible()) return;		this.clickCallback.apply(this);			},		/*		Function: mouseDown		Default mouseDown behavior	*/	mouseDown : function(){			},	/*		Function: afterProcess		extend if needed	*/	afterProcess : function(){		if (this.enterEnabled){			if (Input.keysDown[KEY_RETURN]) this.onClick();		}		if (this.tooltipEnabled){			stroke(255,255,255);			fill(0,0,0);			var w = textWidth(this.tooltip);			var win = window;			if (win.mouseX + w > Engine.width){				lineWidth(1);				rect(win.mouseX - w ,win.mouseY - 30,w + 20,20, 5);								noStroke();				fill(255,255,255);				text(this.tooltip, win.mouseX - w + 10, win.mouseY - 15);			}else{				lineWidth(1);				rect(win.mouseX - w * 0.5 - 10, win.mouseY - 30,w + 20,20, 5);				noStroke();				fill(255,255,255);				text(this.tooltip, win.mouseX - w * 0.5, win.mouseY - 15);			}		}	},		/*		Function: mouseEnter		Default mouseEnter behavior	*/	mouseEnter : function(){		if (!this.enabled || !this.isVisible()) return;		Input.setCursor('pointer');		if (this.tooltip != null){			this.tooltipEnabled = true;		}	},		/*		Function: mouseLeave		Default mouseLeave behavior	*/	mouseLeave : function(){		if (!this.enabled || !this.isVisible()) return;		this.tooltipEnabled = false;		Input.setCursor('default');	},		/*		Function: mouseOver		Default mouseOver behavior	*/	mouseOver : function(){	}});
/*	Classe TextElement display text only	extends BaseElement*/var TextElement = BaseElement.extend({		/*		Constructor:		Parameters:		x - x position		y - y position		lText - text to display		c - color 	*/	constructor : function (x, y, lText, c){		this.base(x,y);		this.instanceName = "TextElement";		this.fontSize = 12;		this.curentText = [];		this.curentText = lText.split("<br />");		this.c = c;		this.ready = false;	},		/*		Function: isReady	*/	isReady : function(){		if (this.ready)return true;		this.height = this.fontSize;		this.width = textWidth(this.curentText);		this.ready = true;		return true;	},	/*		Function: draw		Parameters:		ec - context where to draw	*/	draw : function(ec){		if (!this.visible || !this.isReady()) return;		fill(this.c.r, this.c.g, this.c.b, this.c.a);		textSize(this.fontSize);		for (var i = 0; i < this.curentText.length; i++)			text(this.curentText[i],this.x,this.y + i * (this.fontSize + this.fontSize * 0.5));	},	/*		Function: setTextSize		Parameters:		size - text size	*/	setTextSize : function(size){		this.fontSize = size;	},		/*		Function: setText		Parameters:		text - text to display	*/	setText : function(lText){		this.curentText = lText.split("<br />");	}});
/*	Class: TextBox	extends ColorDrawable implements FocusHandler, MouseOverHandler, KeyPressHandler*/var TextBox = ColorDrawable.extend( {		/*		Constructor:		Parameters:		x - x position		y - y position		width - width		height - height		backgroundColor - background color		textColor - text color	*/	constructor : function(x, y, width, height, backgroundColor, textColor){		this.base(x,y,width,height,backgroundColor);		this.instanceName = "TextBox";		this.textColor = textColor;		this.curentText = "";		this.fontSize = 12;		this.focus = false;		this.showCursor = true;		this.cursorPos = 0;		this.cursorTime = new Timer(300);	},	/*		Function: mouseEnter		Default mouseEnter behavior	*/	mouseEnter : function(){		if (!this.enabled || !this.isVisible()) return;		Input.setCursor('text');		if (this.tooltip != null){			this.tooltipEnabled = true;		}	},		/*		Function: mouseUp		Override if needed	*/	mouseUp : function(){	},		/*		Function: mouseDown		Override if needed	*/	mouseDown : function(){			},		/*			*/	setFocus : function(f){		this.focus = f;	},		/*		*/	onFocus : function(){		if (!this.enabled || !this.isVisible()) return;		this.focus = true;					document.getElementById('keyboard_textbox').focus(); //-->		if (Engine.phone){			//Input.showKeyboard(this);		}	},		/*		*/	onBlur : function(){		this.focus = false;	},		/*		Function: mouseLeave		Default mouseLeave behavior	*/	mouseLeave : function(){		if (!this.enabled || !this.isVisible()) return;		this.tooltipEnabled = false;		Input.setCursor('default');	},		/*		Function: mouseOver		Override if needed	*/	mouseOver : function(){},	/*		Function: keyDown		Extend if needed	*/	keyDown : function(){	var SHIFT = 83;	var CAPSLK = 86;		if (this.focus && textWidth(this.curentText) < this.width - 10){			for (var i = 0; i < Input.keysDown.length; i++){				if (i == KEY_BKSPACE && Input.keysDown[i]){					this.curentText = this.curentText.substring(0, this.curentText.length - 1);					this.cursorPos--;					if (cursorPos < 0) cursorPos = 0;				}else if (Input.keysDown[i]){					if (Input.keysDown[SHIFT] || Input.keysDown[CAPSLK]){						this.curentText += String.fromCharCode(i).toUpperCase();					}else{						this.curentText += String.fromCharCode(i).toLowerCase();					}					this.cursorPos++;				}			}		}	},		/*		Function: keyUp		Override if needed	*/	keyUp : function(){},		/*		Function: draw		Parameters:		ec - context where to draw	*/	draw : function(ec){		this.base();		fill(this.textColor.r,this.textColor.g,this.textColor.b);		textSize(this.fontSize);		if (this.focus){			if (this.showCursor){				text([this.curentText.substring(0,this.cursorPos) , "|" , this.curentText.substring(this.cursorPos,this.curentText.length)].join(''),2,this.height - this.fontSize * 0.5);			}else{				text([this.curentText.substring(0,this.cursorPos), " ", this.curentText.substring(this.cursorPos,this.curentText.length)].join(''),2,this.height - this.fontSize * 0.5);			}		}else{			text(this.curentText,2,this.height - this.fontSize * 0.5);		}		if(this.cursorTime){			if(this.cursorTime.itsTime())				this.showCursor = ++this.showCursor % 2;		}	},		/*		Function: afterProcess		Extend if needed	*/	afterProcess : function(){		if (this.tooltipEnabled){			stroke(255,255,255);			fill(0,0,0);			var w = textWidth(this.tooltip);			if (mouseX + w > Engine.width){				rect(mouseX - w ,mouseY - 30,w + 20,20, 5);								noStroke();				fill(255,255,255);				text(this.tooltip, mouseX - w + 10, mouseY - 15);			}else{				rect(mouseX - w * 0.5 - 10,mouseY - 30,w + 20,20, 5);				noStroke();				fill(255,255,255);				text(this.tooltip, mouseX - w * 0.5, mouseY - 15);			}		}	},		/*		Function: getText		Return current text	*/	getText : function(){		return this.curentText;	}});/*	Class: PasswordBox	extends TextBox implements FocusHandler, MouseOverHandler, KeyPressHandler*/var PasswordBox = TextBox.extend({		/*		Constructor:		Parameters:		x - x position		y - y position		width - width		height - height		backgroundColor - background color		textColor - text color		passwordChar - char to replace letter	*/	constructor : function (x, y, width, height, backgroundColor, textColor, passwordChar){		this.base(x,y,width,height,backgroundColor,textColor);		this.instanceName = "PasswordBox";		this.passwordChar = passwordChar;	},	/*		Function: keyDown		Extend if needed	*/	keyDown : function(){		if (this.focus && textWidth(this.curentText) < this.width - 10){			for (var i = 0; i < Input.keysDown.length; i++){				if (i == KEY_BKSPACE && Input.keysDown[i]){					this.trueText = this.trueText.substring(0, this.curentText.length - 1);					this.curentText = this.curentText.substring(0, this.curentText.length - 1);					cursorPos--;					if (cursorPos < 0) cursorPos = 0;				}else if (Input.keysDown[i]){					if (Input.keysDown[SHIFT] || Input.keysDown[CAPSLK]){						this.trueText += String.fromCharCode(i).toUpperCase();					}else{						this.trueText += String.fromCharCode(i).toLowerCase();					}					this.curentText += passwordChar;					cursorPos++;				}			}		}	},		/*		Function: getText		Return current typped text	*/	getText : function(){		return this.trueText;	}});
/* 
	Class: ParticleSystem
	Simple particle system 
*/
var ParticleSystem = BaseElement.extend({

	/* Construtor: ParticleSystem
		Parameters:
		gravity - define a direction where particle are attracted (useful for wind, fountain, soap bubble...) (this vector is always normalized)
		particleCount - particle count
		diffusionType - LINEAR (foutain) or EXPLOSION (explosion) ...
		continuous - if is true then particles are projected continuously (spread on particleLifetime), else particle are all projected in one impulsion, default : false
		position - epicenter
		impulsion - power of impulsion given at each starting particle
		direction - direction given to each particle (noise applyed) (this vector is always normalized)
		particleLifetime - how many time the particle live
		typeColor - a typeColor : a color(r,g,b,a) or ParticleSystem.RANDOM
		size - particle size
		weigth - particle weight
	*/
	constructor : function (gravity, particleCount, diffusionType, continuous, position, impulsion, direction, particleLifetime, typeColor, particleSize, weight){
		this.base(0,0);
		this.started = false;
		this.gravity = gravity.normalize();
		this.diffusionType = diffusionType;
		this.continuous = continuous;
		this.position = position.get();
		this.impulsion = impulsion;
		this.direction = direction.normalize();
		this.particleLifetime = particleLifetime;
		this.typeColor = typeColor;
		this.particleSize = particleSize;
		this.weight = weight;
		this.computeTime = new Timer(40);
		this.particleCount = particleCount;
		this.particleEmissionTime = new Timer(this.particleLifetime / this.particleCount);
		this.alphaCoefficient = 1 / this.particleLifetime;
		var t = this;
		this.particles = new IncreasingArray(function(){	
			var that = t;
			var p = new Particle(that.position, ParticleSystem.noisedValue(that, that.impulsion), ParticleSystem.noisedVector(that, that.direction),that.particleLifetime, 	ParticleSystem.noisedValue(that, that.weight), that.gravity, Math.abs(ParticleSystem.noisedValue(that, that.particleSize)));
			return p;
		});
		if (this.typeColor.instanceName == 'Drawable')
			 this.typeColorKind = ParticleSystem.DRAWABLE;
		this.initSystem();
	},

	/*
		Function: initSystem
		Initialize a particle
	*/
	initSystem : function(){
		if (!this.continuous){
			for (var i = 0; i < this.particleCount; i++){
				var p = this.particles.get();
				Particle.reset(p, this.position.get(), ParticleSystem.noisedValue(this, this.impulsion));
			}
		}
	},
	
	/*
		Function: reset
		Reset the particle, can help to force changing position of the epicenter
	*/
	reset : function(){
		this.particles.clear();
		for (var i = this.particleCount; --i;){
			this.particles.get();
		}
	},
	
	/*
		Function: play
		Start (or restart) the particle system
	*/
	play : function(){
		this.started = true;
		if (this.particles.size() == 0) { 
			this.initSystem();
		}
	},
	
	/*
		Function: stop
		Stop the particle system
	*/
	stop : function(){
		this.started = false;
	},
	
	/*
		Function: stopped
		Return true if the particle system have terminated
	*/
	stopped : function(){
		return this.started == false;
	},
	
	/*
		Function: setColor
		Set the color of the next particles
		
		Parameters:
		c - color
	*/
	setColor : function(c){
		this.typeColor = c;
	},
	
	/*
		Function: setPos
		Set the next position for the epicenter
	*/
	setPos : function(x, y){
		this.position.x = x;
		this.position.y = y;
	},
	
	/*
		Function: draw
	*/
	draw : function(){
		if (!this.started) return;
		
		if (this.typeColor instanceof Drawable && !this.typeColor.isReady()){
			return;
		}
		var i = this.particles.size() ;
		
		if (i == 0 && !this.continuous){ 
			this.started = false;
			return;
		}
		if (this.continuous && i < this.particleCount && this.particleEmissionTime.itsTime()){
			this.particles.get();
			i++;
		}
		var itsTime = this.computeTime.itsTime();
		var tmp;
		var tmpColor;
		var tmpAlpha;
		noStroke();
		
		do{
			tmp = this.particles.get(--i);
			if (tmp == undefined) continue;
			if (itsTime){
				Particle.compute(tmp);
			}
			if (this.typeColorKind == ParticleSystem.DRAWABLE){
				this.typeColor.setPos(tmp.position.x,tmp.position.y);
			}else{
				if (this.typeColor == ParticleSystem.RANDOM)
					tmpColor = getRandomColor();
				else
					tmpColor = this.typeColor;
				tmpAlpha = tmp.remainingTime.getRemainingTime() * this.alphaCoefficient;
				fill(tmpColor.r,tmpColor.g,tmpColor.b, tmpAlpha * 0.5);
				ellipse(tmp.position.x,tmp.position.y, tmp.particleSize);
				fill(tmpColor.r,tmpColor.g,tmpColor.b, tmpAlpha);
				ellipse(tmp.position.x,tmp.position.y, tmp.semiParticleSize);
			}
			
			if (!Particle.isAlive(tmp) || tmpAlpha < 0.15) {
				if (this.continuous) {
					Particle.reset(tmp, this.position.get(), ParticleSystem.noisedValue(this, this.impulsion));
				}else{
					this.particles.disable(i);
				}
			}
		}while (i >= 0);
	}
	
});


/*
		Return a noised value
*/
ParticleSystem.noisedValue = function(elem, value){
	return noise(random(0,5)) * value  + value + random(-elem.diffusionType, elem.diffusionType);
};

/*
	Return a noised values vector
*/
ParticleSystem.noisedVector = function(elem, v){
	return new Vector(ParticleSystem.noisedValue(elem, v.x),ParticleSystem.noisedValue(elem, v.y));
};

/*
	Define one particle
*/
var Particle = Base.extend({
	enabled : true,
	position : 0,
	impulsion : 0,
	direction : 0,
	lifeTime : 0,
	remainingTime : 0,
	weight : 0,
	gravityEffect : 0,
	inverseLifeTime : 0,
	particleSize : 0,
	semiParticleSize : 0,
		
	constructor : function(position, impulsion, direction, particleLifetime, weight, gravity, particleSize){
		this.enabled = true;
		this.position = position.get();
		this.impulsion = impulsion;
		this.direction = direction.get();
		this.lifeTime = particleLifetime;
		this.remainingTime = new TimeAlarm(this.lifeTime, false);
		this.weight = weight;
		this.gravityEffect = new Vector(this.weight * gravity.x,this.weight * gravity.y);
		this.inverseLifeTime = 1 / this.lifeTime;
		this.particleSize = particleSize;
		this.semiParticleSize = particleSize * 0.5;
	},
	
	/* 
		Return true if this particle is enabled
	*/
	isEnabled : function(){
		return this.enabled;
	},


	/*
		Disable this particle
	*/
	disable : function(){
		this.enabled = false;
	},

	/*
		Enable this particle
	*/
	enable : function(){
		this.enabled = true;
	},
	
});

/*
		Compute next position
	*/
Particle.compute = function(elem){
	elem.position.x += elem.impulsion * elem.direction.x + elem.gravityEffect.x;
	elem.position.y += elem.impulsion * elem.direction.y + elem.gravityEffect.y;
	elem.impulsion = elem.impulsion * elem.remainingTime.getRemainingTime() * elem.inverseLifeTime;
};

/*
	Return true if the particle lifeTime instance is finished
*/
Particle.isAlive = function(elem){
	return !elem.remainingTime.itsTime();
};


/*
		Reset the value of a particle
*/
Particle.reset = function(elem, position, impulsion){
	elem.position = position;
	elem.impulsion = impulsion;
	elem.remainingTime.reset();
},

/* Variable: LINEAR */
ParticleSystem.LINEAR = 0.02;
/* Variable: SEMI_LINEAR */
ParticleSystem.SEMI_LINEAR = 0.3;
/* Variable: SEMI_EXPLOSION */
ParticleSystem.SEMI_EXPLOSION = 1;
/* Variable: EXPLOSION */
ParticleSystem.EXPLOSION = 2;
/* Variable: RANDOM */
ParticleSystem.RANDOM = 0;
/* Variable: DRAWABLE */
ParticleSystem.DRAWABLE = 1;
/*
	Class: GameEntity
	Provide an entity conceived specialy for game
*/
var GameEntity = Entity.extend({
	/* Variable: hp */
	hp : 1,
	/* Variable: maxSpeed
		maxSpeed for movement
	*/
	maxSpeed : 10,
	offset : 10,
	/* Variable: skills
		No skill by default
	*/
	skills : 0,
	invicible : false,
	horizontalOffset : 0,
	verticalOffset : 0,
	
	/*
		Constructor: GameEntity
		Parameters:
		posX - pixel position in X
		posY - pixel position in Y
		img - image path
		sWidth - sprite Width
		sHeight - sprite Height
		sSpeed -  speed of sprite animation

	*/
	constructor : function(posX,posY,img, sWidth, sHeight, sSpeed){
		if (sWidth){
			this.base(posX,posY,img, sWidth, sHeight, sSpeed);
		}else{
			this.base(posX,posY,img, 0,0,0);
		}
		this.skills = new HashMap();
	},
	
	/*
		Function: draw
		Override Entity draw function
	*/
	draw : function(){
		if (this.goTo && !this.animationStarted){
			this.goTo();
		}else if (this.chaseElem && this.chaseElem.enabled && this.chaseElem.state == GameEntity.ALIVE){
			this.chaseMove();
		}
		if (this.keyBoardHandler)
			this.keyBoardHandler();
		this.base();
	},
	
	/*
		Function: setRandomMove
		Entity move randomly in a rectangle area
		
		Parameters:
		minX - min pos X
		maxX - max pos X
		minY - min pos Y
		maxY - max pos Y
		speed - movement's speed
	*/
	setRandomMove : function(minX,maxX,minY,maxY, speed){
		this.goTo = function(){
			BaseElement.goTo(this,random(this.goTo.minX,this.goTo.maxX),random(this.goTo.minY,this.goTo.maxY), speed);
		}
		this.goTo.minX = minX;
		this.goTo.minY = minY;
		this.goTo.maxX = maxX;
		this.goTo.maxY = maxY;
	},
	
	/*
		Function: setChaseMove
		Entity chase an other element
		Parameters: 
		chaseElem - Element to chase
		maxSpeed - Max movement's speed
		step - by of many pixel the element can move
		hitCallBack - on catch chaseElem function to be called
		moveCallBack - on move function to be called
	*/
	setChaseMove : function(chaseElem, maxSpeed, step, hitCallBack,moveCallBack){
		this.maxSpeed = maxSpeed;
		this.offset = step;
		this.chaseElem = chaseElem;
		this.moveTime = new TimeAlarm(20);
		this.hitCallBack = hitCallBack;
		this.moveCallBack = moveCallBack;
	},
	
	/*
		Function: chaseMove
		Perform chase movement
	*/
	chaseMove : function(){
		if (this.moveTime.itsTime()){
			if(this.x < this.chaseElem.x + this.chaseElem.translatedX){
				this.horizontalOffset += this.offset;
			}else{
				this.horizontalOffset -= this.offset;
			}
			if(this.y < this.chaseElem.y  + this.chaseElem.translatedY){
				this.verticalOffset += this.offset;
			}else{
				this.verticalOffset -= this.offset;
			}
			this.moveTime.reset();
		}
		if (this.moveCallBack) this.moveCallBack();
		if (this.hitCallBack && this.hit(this.chaseElem)) this.hitCallBack();
		if (this.horizontalOffset > this.maxSpeed) this.horizontalOffset = this.maxSpeed;
		if (this.horizontalOffset < -this.maxSpeed) this.horizontalOffset = -this.maxSpeed;
		if (this.verticalOffset > this.maxSpeed) this.verticalOffset = this.maxSpeed;
		if (this.verticalOffset < -this.maxSpeed) this.verticalOffset = -this.maxSpeed;
		this.move(this.horizontalOffset, this.verticalOffset, 100);
	},
	
	/*
		Function: setKeyBoardHandler
		Function called at each drawing
		Parameters:
		handler - function to call when move done
	*/
	setKeyBoardHandler : function(handler){
		this.keyBoardHandler = handler;
	},
	
	/*
		Function: setMoveByCallback
		Function called at each drawing
		Parameters:
		handler - function to call when all move done
	*/
	setMoveByCallback : function(callback){
		this.goTo = goToCallback;
	},
	
	/*
		Function: addSkill
		Add a skill to this element
		Parameters:
		skillName - A key to register the skill callback function
		skillCallback - a function to call when skill is casted
	*/
	addSkill : function(skillName, skillCallback){
		this.skills.put(skillName,skillCallback);
	},
	
	/*
		Function: castSkill
		Cast a skill registered with addSkill
		Parameters:
		skillName - name of a registered skill
	*/
	castSkill : function(skillName){
		var tmp = this.skills.get(skillName);
		if (tmp){
			tmp.apply(this);
			return true;
		}
		return false;		
	},
	
	/*
		Function: enableInvicible
	*/
	enableInvicible  : function(){
		this.invicible = true;
	},
	
	/*
		Function: disableInvicible
	*/
	disableInvicible  : function(){
		this.invicible = false;
	},
	
	/*
		Function: die
		Called when hp == 0, run dieCallback
	*/
	die : function(){
		if (this.invicible) return;
		if (this.dieCallback)
			this.dieCallback();
		else
			BaseElement.fadeOut(this,1000, function(){ this.remove(); });
	},

	/*
		Function: setDieCallback
		Parameters:
		dieCallback - function to call when entity die
	*/
	setDieCallback : function(dieCallback){
		this.dieCallback = dieCallback;
	},
	
	/*
		Function: hurted
		Perfom action to hurt an GameEntity, call hurtCallback if needed, or die function if needed
		Parameters:
		damage - number of hp to remove
	*/
	hurted : function(damage){
		if (this.invicible) return;
		if (!damage) damage = 1;
		this.hp -= damage;
		if (this.hp <= 0){
			this.die();
		}else{
			if (this.hurtCallback) this.hurtCallback();
		}
	},
	
	/*
		Function: setHurtCallback
		Parameters:
		callback - function to call when hurted
	*/
	setHurtCallback : function(callback){
		this.hurtCallback = callback;
	}
	
});
GameEntity.ALIVE = 0;
GameEntity.DEAD = 1;
/*
	Class: Filter
	Provide static function to apply filter on the screen or on a BufferedDrawable
*/
var Filter = {}

/*
	Function: grayScale
	Apply gray scale filter
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.grayScale = function(x,y,width,height, bufferedImage) {
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, avg = 0;
	do{
		i -= 2;
		avg = (imgData.data[i] + imgData.data[i-1] + imgData.data[i-2]) * Filter._1Over3;
		imgData.data[i]= avg;
		imgData.data[--i]= avg;
		imgData.data[--i]= avg;
	  
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y); 
}
Filter._1Over3 = 1 / 3;

/*
	Function: blackNWhite
	Apply black and white filter
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	threshold - between 0 and 255, if undefined 127 is taken
	bufferedImage - optional BufferedDrawable
*/
Filter.blackNWhite = function(x,y,width,height, threshold, bufferedImage) {
	if (threshold == undefined) threshold = 127;
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, avg = 0;
	do{
		i -= 2;
		avg = (imgData.data[i] + imgData.data[i-1] + imgData.data[i-2]) * Filter._1Over3;
		if (avg > threshold) avg = 255;
		else avg = 0;
		imgData.data[i]= avg;
		imgData.data[--i]= avg;
		imgData.data[--i]= avg;
	  
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y); 
}

/*
	Function: sepia
	Apply sepia filter
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - option BufferedDrawable
*/
Filter.sepia = function(x,y,width,height, bufferedImage){
	
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = imgData.data[i];
		g = imgData.data[i-1];
		r = imgData.data[i-2];
		imgData.data[i]=  (r * .272) + (g *.534) + (b * .131);
		imgData.data[--i]= (r * .349) + (g *.686) + (b * .168) ;
		imgData.data[--i]= (r * .393) + (g *.769) + (b * .189);
	  
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y); 
}

/*
	Function: gamma
	Change gamma
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	gamma - gamma value between 0 to 10
*/
Filter.gamma = function(x,y,width,height, gamma, bufferedImage){
	contrast = parseFloat(gamma);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4,  r,g,b;
	do{
		i -= 2;
		b = imgData.data[i];
		g = imgData.data[i-1];
		r = imgData.data[i-2];
		imgData.data[i]=  (255 * (Math.pow(b * Filter._1Over255, gamma)));
		imgData.data[--i]= (255 * (Math.pow(g * Filter._1Over255, gamma)));
		imgData.data[--i]= (255 * (Math.pow(r * Filter._1Over255, gamma)));
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}
Filter._1Over255 = 1 / 255;

/*
	Function: contrast
	Change contrast 
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	contrast - value between -127 to 127
	bufferedImage - option BufferedDrawable
*/
Filter.contrast = function(x,y,width,height, contrast, bufferedImage){
	contrast = parseInt(contrast,10);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
	do{
		i -= 2;
		b = imgData.data[i];
		g = imgData.data[i-1];
		r = imgData.data[i-2];	
		imgData.data[i] = factor * (b - 128) + 128;
		imgData.data[--i] = factor * (g - 128) + 128;
		imgData.data[--i] = factor * (r - 128) + 128;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: brightness
	Change brightness
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	brightness - value between -127 to 127
	bufferedImage - option BufferedDrawable
*/
Filter.brightness = function(x,y,width,height, brightness, bufferedImage){
	brightness = parseInt(brightness,10);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = imgData.data[i] + brightness;
		if (b > 255) b = 255;
		if (b < 0) b = 0;
		g = imgData.data[i-1] + brightness;
		if (g > 255) g = 255;
		if (g < 0) g = 0;
		r = imgData.data[i-2] + brightness;
		if (r > 255) r = 255;
		if (r < 0) r = 0;
		imgData.data[i] = b;
		imgData.data[--i] = g;
		imgData.data[--i] = r;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: invert
	Invert color
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.invert = function(x,y,width,height, bufferedImage){
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = 255 - imgData.data[i];
		g = 255 - imgData.data[i-1];
		r = 255 - imgData.data[i-2];
		imgData.data[i] = b;
		imgData.data[--i] = g;
		imgData.data[--i] = r;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: solarize
	Solarize effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	threshold - value between 0 to 255
	bufferedImage - optional BufferedDrawable
*/
Filter.solarise = function(x,y,width,height, threshold, bufferedImage){
	threshold = parseInt(threshold,10);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = imgData.data[i];
		if (b < threshold) b = 255 - b;
		g = imgData.data[i-1];
		if (g < threshold) g = 255 - g;
		r = imgData.data[i-2];
		if (r < threshold) r = 255 - r;
		imgData.data[i] = b;
		imgData.data[--i] = g;
		imgData.data[--i] = r;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: saturation
	Change saturation
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	saturation - value between -1 to 1
	bufferedImage - option BufferedDrawable
*/
Filter.saturation = function(x,y,width,height, saturation, bufferedImage){
	saturation = parseFloat(saturation);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, tmp;
	do{
		i -= 2;
		tmp = rgbToHsl(imgData.data[i - 2],imgData.data[i-1],imgData.data[i]);
		tmp = hslToRgb(tmp[0], tmp[1] + saturation,tmp[2]);
		imgData.data[i] = tmp[2];
		imgData.data[--i] = tmp[1];
		imgData.data[--i] = tmp[0];
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: hue
	Change hue
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	hue - value between -1 to 1
	bufferedImage - optional BufferedDrawable
*/
Filter.hue = function(x,y,width,height, hue, bufferedImage){
	hue = parseFloat(hue);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, tmp;
	do{
		i -= 2;
		tmp = rgbToHsl(imgData.data[i - 2],imgData.data[i-1],imgData.data[i]);
		tmp = hslToRgb(tmp[0] + hue,tmp[1],tmp[2]);
		imgData.data[i] = tmp[2];
		imgData.data[--i] = tmp[1];
		imgData.data[--i] = tmp[0];
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: emboss
	Emboss effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.emboss = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[-2,-1,0,-1,1,1,0,1,2],bufferedImage);
}

/*
	Function: blur
	Blur effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.blur = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9],bufferedImage);
}

/*
	Function: edge
	Edge effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.edge = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[0,1,0,1,-4,1,0,1,0],bufferedImage);
}

/*
	Function: sharpen
	Sharpen effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.sharpen = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[0,-1,0,-1,5,-1,0,-1,0],bufferedImage);
}


/*
	Function: applyKernel
	Apply a convolution 3x3 kernel 
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	kernel - a kernel array of 9 values
	bufferedImage - optional BufferedDrawable
*/
Filter.applyKernel = function(x,y,width,height,kernel, bufferedImage){
	if (!kernel || kernel.length != 9) return;
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var count = width * height * 4;
	var tmp0 = 0;
	var tmp1 = 0;
	var tmp2 = 0;
	var r = 0;
	var c = 0;
	var wm14 = (width - 1) * 4;
	var wp14 = (width + 1) * 4;
	var w4 = width * 4;
	var d = imgData.data;
	
	var clone =[];
	
	for (var i = 0; i < d.length; i++)
		clone[i] = d[i];
	
	for (var i = 0; i < count; i+=4){
		tmp0 = 0;
		tmp1 = 0;
		tmp2 = 0;
		var i1 = i + 1;
		var i2 = i + 2;
		
		if (r > 0){
			if (c > 0){
				tmp0 += clone[i - wp14] * kernel[0];
				tmp1 += clone[i1 - wp14] * kernel[0];
				tmp2 += clone[i2 - wp14] * kernel[0];
			}
			tmp0 += clone[i - w4] * kernel[1];
			tmp1 += clone[i1 - w4] * kernel[1];
			tmp2 += clone[i2 - w4] * kernel[1];
			
			if (c <  width - 1){
				tmp0 += clone[i - wm14] * kernel[2];
				tmp1 += clone[i1 - wm14] * kernel[2];
				tmp2 += clone[i2 - wm14] * kernel[2];
			}
		}
		
		if (c > 0){
			tmp0 += clone[i - 4] * kernel[3];
			tmp1 += clone[i - 3] * kernel[3];
			tmp2 += clone[i - 2] * kernel[3];

		}
		
		tmp0 += clone[i] * kernel[4];
		tmp1 += clone[i1] * kernel[4];
		tmp2 += clone[i2] * kernel[4];
		
		if (c < width - 1){
			tmp0 += clone[i + 4] * kernel[5];
			tmp1 += clone[i + 5] * kernel[5];
			tmp2 += clone[i + 6] * kernel[5];
		}
		
		if (r < height - 1){
			if (c > 0){
				tmp0 += clone[i + wm14] * kernel[6];
				tmp1 += clone[i1 + wm14] * kernel[6];
				tmp2 += clone[i2 + wm14] * kernel[6];
			}
		
			tmp0 += clone[i + w4] * kernel[7];
			tmp1 += clone[i1 + w4] * kernel[7];
			tmp2 += clone[i2 + w4] * kernel[7];
			if (c < width - 1){
				tmp0 += clone[i + wp14] * kernel[8];
				tmp1 += clone[i1 + wp14] * kernel[8];
				tmp2 += clone[i2 + wp14] * kernel[8];
			}
		}
		d[i] = (tmp0 < 0)?0:(tmp0 > 255)?255:floor(tmp0); 		//r
		d[i1] = (tmp1 < 0)?0:(tmp1 > 255)?255:floor(tmp1);	//g
		d[i2] = (tmp2 < 0)?0:(tmp2 > 255)?255:floor(tmp2);	//b
		
		c++;
		if (c >= width){
			c = 0;
			r++;
		}
		
	}
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
	else
		bufferedImage.update();
}
 
/*
	Function: rgbToHsl
	Converts an RGB color value to HSL.
	
	Assumes r, g, and b are contained in the set [0, 255] and
	
	returns h, s, and l in the set [0, 1].
 
	Parameters:
	r - The red color value
	g - The green color value
	b - The blue color value
  
	Return: Array containing the HSL representation
*/
function rgbToHsl(r, g, b){
    r *= rgbToHsl._255;
	g *= rgbToHsl._255;
	b *= rgbToHsl._255;
	
    var max = r;
	if (g > max) max = g;
	if (b > max) max = b;
	var min = r;
	if (min > g) min = g;
	if (min > b) min = b;
    var h, s, l = (max + min) * 0.5;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        if (l > 0.5)
			s = d / (2 - d);
		else
			s = d / (max + min);
        if (max == r)
            h = (g - b) / d + (g < b ? 6 : 0);
		else if (max == g)
            h = (b - r) / d + 2;
		else 
            h = (r - g) / d + 4;
        h *= 0.1666667;
    }

    return [h, s, l];
}
rgbToHsl._255 = 1/255;


/*
	Function: hslToRgb
	Converts an HSL color value to RGB.
	
	Assumes h, s, and l are contained in the set [0, 1] and
	
	returns r, g, and b in the set [0, 255].
	
	Parameters:
		h - The hue
		s - The saturation
		l - The lightness
	
	Return:  Array of the RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hslToRgb.hue2rgb(p, q, h + 0.33333333);
        g = hslToRgb.hue2rgb(p, q, h);
        b = hslToRgb.hue2rgb(p, q, h - 0.33333333);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

hslToRgb.hue2rgb = function (p, q, t){
	if(t < 0) t += 1;
	if(t > 1) t -= 1;
	if(t < 0.16666667) return p + (q - p) * 6 * t;
	if(t < 0.5) return q;
	if(t < 0.66666667) return p + (q - p) * (0.66666667 - t) * 6;
	return p;
}
window.translations = new HashMap();

/*
	Function: setLanguage
	*global*
	
	Set current displaying language
	
	Parameters:
	languageCode - 'FR', 'EN', 'ES', 'IT'...
*/
function setLanguage(languageCode){
	storage.setItem('language', languageCode.toUpperCase());
}

/*
	Function: addText
	*global*
	
	ASCII String without space
	
	Parameters:
	languageCode - 'FR', 'EN', 'ES', 'IT'...
	key - key
	val - val
*/
function addText(languageCode, key, value){
	key = key.replace(/ /g,'_');
	translations.put(key.toUpperCase() + languageCode.toUpperCase(), value);
}

/*
	Function: __text
	*global*
	
	Return text translation for a specified key
	
	Parameters:
	key - key
*/
function __text(key){
	return translations.get(key.toUpperCase() + storage.getItem('language'));
}
