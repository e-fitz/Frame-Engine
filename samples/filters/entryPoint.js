/*Copyright (C) 2013 Dourthe Aymeric

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
var area = new Area();
var img, pixels, haveChange = false;
var gamma, c, brightness,hue,saturation;
var mode = 0, value = 1;

function setup(){
	Engine.init();
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(area);
}

area.init = function(){
	
	img = new BufferedDrawable(0,0,"images/landscape.jpg");
	img.beforeProcess = function(){
		pixels = img.getPixels();
		BaseElement.pixelScale(img, Engine.width,Engine.height);
		this.beforeProcess = null;
	}
	this.addDrawable(1,img);

	var accordion = new Accordion(0,0,"images/correction.png", color(255,255,255), "");
	this.addDrawable(0,accordion);
	var tmp =  new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), "Contrast",function(){ 
		showContrast();
	});
	this.addDrawable(0,tmp);
	accordion.addItem(tmp);
	
	tmp  =new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), __text("Brightness"),function(){ 
		showBrightness();
	});
	this.addDrawable(0,tmp);
	accordion.addItem( tmp);
	
	tmp  =new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), "Hue",function(){ 
		showHue();
	});
	this.addDrawable(0,tmp);
	accordion.addItem( tmp);
	
	tmp  =new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), "Saturation",function(){ 
		showSaturation();
	});
	this.addDrawable(0,tmp);
	accordion.addItem( tmp);
	
	tmp  =new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), "Gamma",function(){ 
		showGamma();
	});
	this.addDrawable(0,tmp);
	accordion.addItem( tmp);
	
	accordion.displayOn(Accordion.vertical);
	
	
	var accordion2 = new Accordion(100,0,"images/correction.png", color(255,255,255), "");
	
	tmp  =new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), "Gray",function(){ 
		showGray();
	});
	this.addDrawable(0,tmp);
	accordion2.addItem( tmp);
	
	tmp  =new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), "Black & White",function(){ 
		showBnW();
	});
	this.addDrawable(0,tmp);
	accordion2.addItem( tmp);
	
	tmp  =new SimpleButton(0,0,80,20,color(200,200,200), color(0,0,0), "Sepia",function(){ 
		showSepia();
	});
	this.addDrawable(0,tmp);
	accordion2.addItem( tmp);
	storage.removeItem('language');
	
	
	accordion2.displayOn(Accordion.vertical);
	
	this.addDrawable(0,accordion2);
}

function showContrast(){
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Contrast", color(0,0,0)));
	c = new Slider(popup.width * 0.5 - Engine.width * 0.4 * 0.5,100, Engine.width * 0.4, color(135,135,135), color(80,80,80), -127, 127);
	c.setVal(0);
	c.setValueChangeHandler(function(){
		img.setPixels(pixels.slice(0,pixels.length));
		Filter.contrast(0,0,img.width,img.height,c.getVal(),img);
		img.update();
	});
	popup.addItem(c);
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}

function showBrightness(){
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Brightness", color(0,0,0)));
	c = new Slider(popup.width * 0.5 - Engine.width * 0.4 * 0.5,100, Engine.width * 0.4, color(135,135,135), color(80,80,80), -127, 127);
	c.setVal(0);
	c.setValueChangeHandler(function(){
		img.setPixels(pixels.slice(0,pixels.length));
		Filter.brightness(0,0,img.width,img.height,c.getVal(),img);
		img.update();
	});
	popup.addItem(c);
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}

function showHue(){
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Hue", color(0,0,0)));
	c = new Slider(popup.width * 0.5 - Engine.width * 0.4 * 0.5,100, Engine.width * 0.4, color(135,135,135), color(80,80,80), -1, 1);
	c.setVal(0);
	c.setValueChangeHandler(function(){
		img.setPixels(pixels.slice(0,pixels.length));
		Filter.hue(0,0,img.width,img.height,c.getVal(),img);
		img.update();
	});
	popup.addItem(c);
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}

function showSaturation(){
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Saturation", color(0,0,0)));
	c = new Slider(popup.width * 0.5 - Engine.width * 0.4 * 0.5,100, Engine.width * 0.4, color(135,135,135), color(80,80,80), -1, 1);
	c.setVal(0);
	c.setValueChangeHandler(function(){
		img.setPixels(pixels.slice(0,pixels.length));
		Filter.saturation(0,0,img.width,img.height,c.getVal(),img);
		img.update();
	});
	popup.addItem(c);
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}


function showGamma(){
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Gamma", color(0,0,0)));
	c = new Slider(popup.width * 0.5 - Engine.width * 0.4 * 0.5,100, Engine.width * 0.4, color(135,135,135), color(80,80,80), 0, 10);
	c.setVal(1);
	c.setValueChangeHandler(function(){
		img.setPixels(pixels.slice(0,pixels.length));
		Filter.gamma(0,0,img.width,img.height,c.getVal(),img);
		img.update();
	});
	popup.addItem(c);
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}

function showGray(){
	img.setPixels(pixels.slice(0,pixels.length));
	Filter.grayScale(0,0,img.width,img.height, img);
	img.update();
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Validate changes ?", color(0,0,0)));
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}

function showBnW(){
	img.setPixels(pixels.slice(0,pixels.length));
	Filter.blackNWhite(0,0,img.width,img.height, 127, img);
	img.update();
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Validate changes ?", color(0,0,0)));
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}

function showSepia(){
	img.setPixels(pixels.slice(0,pixels.length));
	Filter.sepia(0,0,img.width,img.height, img);
	img.update();
	var popup = new PopUp(Engine.width * 0.5, Engine.height * 0.5, Engine.width * 0.5, Engine.height * 0.5, color(200,200,200,220));
	popup.setStroke(10,color(100,100,100,0));
	popup.setCorners(10,10,10,10);
	popup.addItem(new TextElement(10,50, "Validate changes ?", color(0,0,0)));
	popup.addItem(new SimpleButton(popup.width * 0.3, 150, 70,20,color(200,200,200),color(0,0,0),"Cancel", function(){ img.setPixels(pixels.slice(0,pixels.length)); img.update(); popup.hide();}));
	popup.addItem(new SimpleButton(popup.width * 0.7, 150, 70,20,color(200,200,200),color(0,0,0),"Validate", function(){ pixels = img.getPixels(); popup.hide();}));
	Engine.currentArea.addDrawable(0,popup);
	popup.show();
}

var PopUp = ColorDrawable.extend({
	
	constructor : function(x,y,width,height,bgColor){
		this.base(x,y,width,height,bgColor);
		this.visible = false;
		this.scale(0,0);
		this.items = [];
	},
	
	show : function(){
		this.visible = true;
		BaseElement.scaleTo(this,1,1,1000, true, function(){
			for (var i = 0; i < this.items.length; i++){
				this.items[i].visible = true;
			}
		});
	},
	
	hide : function(){
		this.visible = false;
		for (var i = 0; i < this.items.length; i++){
			this.items[i].visible = false;
		}
		BaseElement.scaleTo(this,0,0,1000,true);
	},
	
	addItem : function(item){
		item.visible = false;
		this.items.push(item);
	},
	
	draw : function(){
		if (!this.isReady()) return;
		this.base();
	},
	
	isReady : function(){
		if (this.ready)return true;
		if (!this.base()) return;
		for (var i = 0; i < this.items.length; i++){
			if (!this.items[i].isReady()){
				return false;
			}
		}
		for (var i = 0; i < this.items.length; i++){
			BaseElement.attachTo(this.items[i], this);
			this.items[i].owner.offsetX = this.items[i].x;
			this.items[i].owner.offsetY = this.items[i].y;
			Engine.currentArea.addDrawable(0,this.items[i]);
		}
		this.ready = true;
		return true;
	}
	
});

var LineLayout = BaseElement.extend({
	
	constructor : function(container){
		this.base(0,0);
		this.container = container;
		this.items = [];
		this.margin = {left:0,top:0};
	},
	
	draw : function(){ this.isReady(); },
	
	setMargin : function(left,top){
		this.margin.left = left;
		this.margin.top = top;
	},
	
	setSpaceBetween : function(space){
		this.space = space;
	},
	
	addItem : function(item){
		this.items.push(item);
	},
	
	isReady : function(){
		if (this.ready)return true;
		for (var i = 0; i < this.items.length; i++){
			if (!this.items[i].isReady()) return false;
		}
		var offset = this.margin.top;
		for (var i = 0; i < this.items.length; i++){
			BaseElement.attachTo(this.items[i], this.container);
			this.items[i].owner.offsetX = this.margin.left;
			this.items[i].owner.offsetY = offset;
			offset += this.items[i].height + this.space;
			Engine.currentArea.addDrawable(0,this.items[i]);
		}
		this.ready = true;
		return true;
	}
	
});