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
	},
	
	/*
		Function: changeImage
		
		Permit to change elem image
		
		Parameters:
		imName - image path
		callback - optional
	*/
	changeImage : function(imName, callback){
		this.imageName = imName;
		this.im = library.get(imName);
		if (!this.im){
			Library.addImage(imName);
		}
		this.scaling.x = 1;
		this.scaling.y = 1;
		this.scaling.z = 0;
		this.ready = false;
		this.onReady = callback;
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
	},
	
	/*
		Function: getWidth
		Return sprite width
	*/
	getWidth : function(){
		return this.spriteWidth;
	},
	
	/*
		Function: getHeight
		Return sprite height
	*/
	getHeight : function(){
		return this.spriteHeight;
	},
		
		
	/*
		Function: start
		Start a paused or stopped animation
		
	*/
	start : function(){
		this.started = true;
	},

	/*
		Function: stopSequence
		Reset the current animation
		
	*/
	stopSequence : function(){
		if (this.sequences != null)
			this.step = this.sequences[this.sequence][0];
	},

	/*
		Function: pause
		Pause current animation
		
	*/
	pause : function(){
		this.started = false;
	},

	/*
		Function: setAutoAnimated
		Set at true if the animation have to be played automaticaly (sequence playing continuously)
		
		Parameters: 
		value - boolean
	*/
	setAutoAnimated : function(value){
		this.auto = value;
	},

	/*
		Function: nextStep
		Advance the animation to the next part
		
	*/
	nextStep : function(){
		this.step = ++this.step % this.steps.length;
	},

	/*
		Function: playSequence
		Start playing a new sequence
		
		Parameters:
		seq - sequence id
		callback - called when sequence done or null
	*/
	playSequence : function(seq, callback){
		if (this.sequences == null) {
			if (DEBUG_MODE)
				console.error("Sequences have not been set for " + this.imageName);
			return;
		}
		if (this.sequences.length < seq){
			if(DEBUG_MODE)
				console.error("Sequence " + seq + " doesn't exist");
			return;
		}
		this.started = true;
		this.sequence = seq;
		this.step = this.sequences[seq][0];
		this.sequenceCallback = callback;
		this.auto = false;
	},

	/*
		Function: setSequence
		Permit to defined different sequences of animation inside a sprite
		
		Parameters:
		seq - [[0,2],[5,9],[3,4]]
	*/
	setSequences : function( seq){
		this.sequences = seq;
	},


	/*
		Function: changeSpeed
		Change sprite speed
		
		Parameters:
		s - speed
	*/
	changeSpeed : function( speed){
		this.tSprite.changeInterval(speed);
	}
});


/*
	Function: AnimatedDrawable.start
	Start a paused or stopped animation
	
	Parameters:
	elem - element
*/
AnimatedDrawable.start = function(elem){
	elem.started = true;
};

/*
	Function: AnimatedDrawable.stopSequence
	Reset the current animation
	
	Parameters:
	elem - element
*/
AnimatedDrawable.stopSequence = function(elem){
	if (elem.sequences != null)
		elem.step = elem.sequences[elem.sequence][0];
};

/*
	Function: AnimatedDrawable.pause
	Pause current animation
	
	Parameters:
	elem - element
*/
AnimatedDrawable.pause = function(elem){
	elem.started = false;
};

/*
	Function: AnimatedDrawable.setAutoAnimated
	Set at true if the animation have to be played automaticaly (sequence playing continuously)
	
	Parameters: 
	elem - element
	value - boolean
*/
AnimatedDrawable.setAutoAnimated = function(elem, value){
	elem.auto = value;
};

/*
	Function: AnimatedDrawable.nextStep
	Advance the animation to the next part
	
	Parameters:
	elem - element
*/
AnimatedDrawable.nextStep = function(elem){
	elem.step = ++elem.step % elem.steps.length;
};

/*
	Function: AnimatedDrawable.playSequence
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
	Function: AnimatedDrawable.setSequence
	Permit to defined different sequences of animation inside a sprite
	
	Parameters:
	elem - element
	seq - [[0,2],[5,9],[3,4]]
*/
AnimatedDrawable.setSequences = function(elem, seq){
	elem.sequences = seq;
};


/*
	Function: AnimatedDrawable.changeSpeed
	Change sprite speed
	
	Parameters:
	elem - element
	s - speed
*/
AnimatedDrawable.changeSpeed = function(elem, speed){
	elem.tSprite.changeInterval(speed);
}

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
			ellipse(floor(this.x) , floor(this.y),this.scaledWidth,ec);
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
			this.isRgba = (this.pixels.data.length / 4 / this.width) == this.height;
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
		c - color array [red, green, blue, alpha (optional)]
	*/
	setPixel : function(x,y,c){
		if (this.isRgba){			
			var tmp = x * this.width * 4 + y * 4;
		}else{
			var tmp = x * this.width * 3 + y * 3;
		}
		if (tmp + 2 < this.pixels.data.length){
			this.pixels.data[tmp] = c.r;
			this.pixels.data[tmp + 1] = c.g;
			this.pixels.data[tmp + 2] = c.b;
			if (this.isRgba){
				this.pixels.data[tmp + 3] = c.a;
			}
		}
	},
	
	/*
		Function: getPixel
		Parameters:
		x - x pos
		y - x pos
	*/
	getPixel : function(x,y){
		if (this.isRgba){			
			var tmp = x * this.width * 4 + y * 4;
			if (tmp + 3 < this.pixels.length){
				return color(this.pixels[tmp],this.pixels[tmp + 1],this.pixels[tmp + 2], this.pixels[tmp + 3]);
			}
		}else{
			var tmp = x * this.width * 3 + y * 3;
			if (tmp + 2 < this.pixels.length){
				return color(this.pixels[tmp],this.pixels[tmp + 1],this.pixels[tmp + 2]);
			}
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