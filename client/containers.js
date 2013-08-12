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
