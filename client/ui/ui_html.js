/*
Copyright (C) 2013 Dourthe Aymeric, Simon Perigault

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

	Class: Form
	HTML gestionary for UI implementation
*/

var Form = IncreasingArray.extend({
	formName : "",
	toolbox : "",
	postUrl : "",
	/* Variable: formName 
		Unique identifier for the form
	*/
	
	/*
		Constructor: Form
		Parameters:
		name - formName unique identifier for the form
		area - area workspace for the form
	*/
	constructor : function(name, area, url){
		this.base(function(){return new htmlDrawable(0,0)});
		this.formName = name;
		this.area = area;
		this.postUrl = url;
		this.toolbox = document.getElementById("tool");
		if(!this.toolbox){
			this.toolbox = document.createElement("div");
			this.toolbox.id = "tool";
			document.body.appendChild(this.toolbox);
		}
	},
	
	/*	
		Function: appendElement
		Add a html element into the form
		
		Parameters:
		elementName - The name of HTML element to add
		x - x position to show the element
		y - y position to show the element
		width - width of the element
		height - height of the element
	*/
	appendElement : function(elementName, x, y, width, height){
			if(!x){x=0;}
			if(!y){y=0;}

			
			var element = document.createElement(elementName);
			element.style.position = "absolute";
			element.style.top = y* Engine.resizeRatio+"px";
			element.style.left = x* Engine.resizeRatio+"px";
			element.style.fontSize = (12 * Engine.resizeRatio) + "px";
			if(width){element.style.width = (width * Engine.resizeRatio)+"px";}
			if(height){element.style.height = (height * Engine.resizeRatio)+"px";}
			this.get();
			var uiElement = this.get(this.size()-1);
			uiElement.id = elementName;
			uiElement.x = parseInt(element.style.left);
			uiElement.y = parseInt(element.style.top);
			uiElement.width = parseInt(element.style.width);
			uiElement.height = parseInt(element.style.height);
			uiElement.html = element;
			this.area.addDrawable(0,uiElement);
			this.toolbox.appendChild(element);
			return uiElement;
	},
	/*	
		Function: appendInput
		Add a input element into the form
		
		Parameters:
		type - The type of input element to add
		x - x position to show the element
		y - y position to show the element
		size - Number of char show in horizontal size (if the width is not specified)
		width - width of the element
		height - height of the element
	*/
	appendInput : function(type, postName, x, y, size, id, width, height){
			if(!x){x=0;}
			if(!y){y=0;}
			if(!id){id = this.formName+"_"+type+"_"+Math.round(Math.random()*10000);}
			if(!size){size = 15;}
			
			var element = document.createElement("input");
			element.style.position = "absolute";
			element.type = type;
			element.id = id;
			element.style.top = y* Engine.resizeRatio+"px";
			element.style.left = x* Engine.resizeRatio+"px";
			element.name = postName;
			element.style.fontSize = (12 * Engine.resizeRatio) + "px";
			if(width){element.style.width = (width * Engine.resizeRatio)+"px";}
			if(height){element.style.height = (height * Engine.resizeRatio)+"px";}
			
			this.get();
			var uiElement = this.get(this.size()-1);
			
			uiElement.id = id;
			uiElement.x = parseInt(element.style.left);
			uiElement.y = parseInt(element.style.top);
			uiElement.width = parseInt(width);
			uiElement.height = parseInt(height);
			uiElement.postName = postName;
			uiElement.html = element;
			this.area.addDrawable(0,uiElement);
			this.toolbox.appendChild(element);
			canvas.style.left = "100px";
			return uiElement;

	},
	post : function(url, onSuccess){
		var data = [];
		if(!url && this.postUrl){
			url = this.postUrl;
		}
		if(!url){
			die;
		}
		for(i=0; i< this.size(); i++){
			if(this.get(i).html.nodeName == "INPUT"){
				data[this.get(i).postName] = this.get(i).html.value;
			}
		}
		//if(data.length > 0){
			return frameHelper().getJSON(url, data, onSuccess);
		//}
		//else{
		//	die;
		//}
	}
});

var htmlDrawable = BaseElement.extend({
	defaultValue : "",
	instanceName : "htmlDrawable",
	constructor : function(x,y){
		this.base(x,y);
		this.x = x;
		this.y = y;
	},
	draw : function(){
	},
	beforeProcess : function(){
		var left = parseInt(this.html.style.left);
		var top = parseInt(this.html.style.top);
		var width = parseInt(this.html.style.width);
		var height = parseInt(this.html.style.height);
		
		if(this.x != left){
			this.html.style.left = this.x+"px";
		}
		if(this.y != top){
			this.html.style.top = this.y+"px";
		}
		if(this.width != width){
			this.html.style.width = this.scaledWidth+"px";
		}
		if(this.height != height){
			this.html.style.height = this.scaledHeigth+"px";
		}
	}
});