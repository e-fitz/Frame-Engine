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
var ProgressBar = BaseElement.extend({ 
	constructor : function(x, y, callBack){
		this.base(x,y);
		this.instanceName = "progressBar";
		this.tooltipEnabled  = false;
		this.textColor = color(255,255,255);
		this.label = "Progress Bar";
		this.defaultSize = 12;
		this.enterEnabled = false;
		this.valueMin = 0;
		this.valueMax = 100;
		this.lastValue = 0;
		this.value = 0;
		this.childAreIni = false;
		this.width = 500;
		this.height = 35;
		if(callBack){
			this.onFinish = callBack;
		}
	},
	isReady : function(){
		if(this.base()){
			if(!this.childAreIni){
				this.valueBar = new ColorDrawable(0,0, this.width, 1, color(250,0,0, 200));	
				BaseElement.attachTo(this.valueBar, this)
				this.valueBar.owner.elem.offsetX = 5;
				BaseElement.pixelScale(this.valueBar,0,this.height);
				this.valueBar.owner.elem.offsetY = this.height;
				var a = Engine.currentArea;
				a.addDrawable(1,this.valueBar);
				this.childAreIni = true;
			}
			return true;
			
		}
		return false;

	},
	/* */
	enableReturn : function(){
		this.enterEnabled = true;
	},
	
	/* */ 
	disableReturn : function(){
		this.enterEnabled = true;
	},
	
	/*
	*/
	setRollover : function(img){
		this.pathRollover = img;
	},
	
	onMouseUp : function(){

	},
	onMouseDown : function(){
		
	},
	refresh : function(){
		if(this.value <= this.valueMax){
			this.lastValue = this.value;
			var ratio = this.value / this.valueMax;
			var newWeight = this.width * ratio;
			BaseElement.pixelScale(this.valueBar,newWeight,this.height);
		}
		else{
			this.onFinish.apply(this);
		}
	},
	
	draw : function(){
		this.base();
		noStroke();
		
		if(this.value != this.lastValue){
			this.refresh();
		}
		textSize(this.defaultSize);
		fill(this.textColor.r,this.textColor.g,this.textColor.b);
		text(this.label, this.x, this.y - this.defaultSize);
	},
	/*
	
	*/
	mouseEnter : function(){
		if (!this.enabled || !this.isVisible()) return;
		Input.setCursor('pointer');
		if(this.pathRollover){
			Drawable.changeImage(this, this.pathRollover);		
		}
	},
	
	/*
	
	*/
	mouseLeave : function(){
		if (!this.enabled || !this.isVisible()) return;
		Input.setCursor('default');
	},
	
	/*
	
	*/
	mouseOver : function(){	},
});