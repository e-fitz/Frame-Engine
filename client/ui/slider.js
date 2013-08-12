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
var Slider = BaseElement.extend({
	instanceName : "Slider",
	
	constructor : function (x, y, width, bgColor, sliderColor, min , max){
		this.base(x,y);
		this.width = width;
		this.height = Engine.height * 0.05;
		this.scaledWidth = width;
		this.scaledHeight = 15;
		this.bar = new ColorDrawable(0,0,width,Engine.height*0.01,bgColor);
		this.bar.setCorners(5,5,4,5);
		this.bar.beforeProcess = function(){
			if(BaseElement.isOver(this)){
				Input.setCursor('pointer');
				this.wasOver = true;
				if(Engine.mousePressed){
					this.owner.elem.slider.owner.offsetX = mouseX - this.owner.elem.x;
				}
			}else if (this.wasOver){
				Input.setCursor('default');
				this.wasOver = false;
			}
		}
		BaseElement.attachTo(this.bar,this);
		this.min = min;
		this.max = max;
		this.slider = new ColorDrawable(0,0,width * 0.01, Engine.height * 0.03, sliderColor);
		BaseElement.attachTo(this.slider,this);
		this.slider.owner.offsetY = - Engine.height * 0.03 * 0.3;
		this.slider.setCorners(2,2,2,2);
		this.slider.beforeProcess = function(){
			if (BaseElement.isOver(this)){
				Input.setCursor('pointer');
				this.wasOver = true;
				if (Engine.mousePressed && !this.dragEnabled) this.dragEnabled = true;
			}else if (this.wasOver){
				this.wasOver = false;
				Input.setCursor('default');
			}
			if (!Engine.mousePressed){ 
				if (this.dragEnabled && this.owner.elem.valueChange){
					this.owner.elem.valueChange();
				}
				this.dragEnabled = false;
			}
			if (this.dragEnabled){
				if (this.owner.elem.onMove) this.owner.elem.onMove();
				this.owner.offsetX = mouseX - this.owner.elem.x;
				if (this.owner.offsetX < 0) this.owner.offsetX = 0;
				if (this.owner.offsetX > this.owner.elem.width) this.owner.offsetX = this.owner.elem.width;
				
			}
		}
	},
	
	draw:function(){
		if (this.visible){
			this.slider.visible = true;
			this.bar.visible = true;
		}else{
			this.slider.visible = false;
			this.bar.visible = false;
		}
	},
	
	setValueChangeHandler : function(handler){
		this.valueChange = handler;
	},
	
	setValueMoveHanlder : function(handler){
		this.onMove = handler;
	},
	
	beforeProcess : function(){
		Engine.currentArea.addDrawable(0,this.bar);
		Engine.currentArea.addDrawable(0,this.slider);
		this.beforeProcess = null;
	},
	
	setVal : function(val){
		if (val < this.min) 
			this.slider.owner.offsetX = 0;
		else if (val > this.max)
			this.slider.owner.offsetX = this.bar.width;
		else
			this.slider.owner.offsetX = ((val - this.min) / (this.max - this.min)) * this.bar.width;
	},
	
	getVal : function(){
		return (this.max - this.min) * (this.slider.owner.offsetX / this.width) + this.min;
	}
	

});