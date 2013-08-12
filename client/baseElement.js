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
		this.flip = {x : 1, y : 1};
		var f = Functions.functionExists;
		this.state = 0;
		
		if (f("keyDown", this) && f("keyUp", this)){
			this.keyPressHandler = true;
		}
		if (f("mouseUp", this) && f("mouseDown", this)){
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
		if (this.boundingBox[4] == BaseElement.RECT && b.boundingBox[4] == BaseElement.RECT){
			var eca = Engine.currentArea;
			return ((eca.x + this.x + this.boundingBox[0] < eca.x + b.x + b.boundingBox[2])	// x
			&& (eca.x + this.x + this.boundingBox[2] > eca.x + b.x + b.boundingBox[0])
			&& (eca.y + this.y + this.boundingBox[1] < eca.y + b.y + b.boundingBox[3])
			&& (eca.y + this.y + this.boundingBox[3] > eca.y + b.y + b.boundingBox[1]));
		}else if (this.boundingBox[4] == BaseElement.CIRCLE && b.boundingBox[4] == BaseElement.CIRCLE){
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
	
		
	/*
		Function: reset
		
		
		Reset x,y and angle
	*/
	reset : function(){
		this.x = -Engine.currentArea.pos.x - this.width;
		this.y = -Engine.currentArea.pos.y - this.height;
		this.rightBound = this.x + this.scaledWidth;
		this.bottomBound = this.y + this.scaledHeight;
		this.angle = 0;
		this.visible = true;
	},

	/*
		Function: setPathModifier
		
		
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
	setPathModifier : function(modifier){
		if (modifier.angle == undefined) modifier.angle = 0;
		if (modifier.offsetX == undefined) modifier.offsetX = 0;
		if (modifier.offsetY == undefined) modifier.offsetY = 0;
		if (modifier.auto == undefined && modifier.type != BaseElement.HEADING) modifier.auto = false;
		else if (modifier.type == BaseElement.HEADING) modifier.auto = true;
		if (modifier.applyToX == undefined) modifier.applyToX = true;
		if (modifier.applyToY == undefined) modifier.applyToY = true;
		modifier.state = 0;
		this.pathModifier = modifier;
	},

	/*
		Function: resetPathModifier
		
		
		Reset path modifier
	*/
	resetPathModifier : function(){
		this.pathModifier = { type : NONE };
	},

	/*
		Function: enableDraggable
		
		
		Enable draggable mechanism to an element
		
	*/
	enableDraggable : function(){
		if (!this.draggable){
			Engine.addDragHandler(elem);
			this.draggable = true;
			this.haveEvent = this.keyPressHandler | this.clickHandler | this.focusHandler | this.focusHandler | this.mouseOverHandler | this.draggable;	
		}
	},

	/*
		Function: disableDraggable
		
		
		disable draggable to an element
		
	*/
	disableDraggable : function(){
		if (this.draggable){
			Engine.removeDragHandler(this);
			this.draggable = false;
			this.haveEvent = this.keyPressHandler | this.clickHandler | this.focusHandler | this.focusHandler | this.mouseOverHandler | this.draggable;	
		}
	},

	/*
		Function: fadeIn
		

		Fade in animation
		
		Parameters:
		timeToReach - time to reach the end of animation
		callback - callback
	*/
	fadeIn : function(timeToReach, callback){
		if (!this.enabled) return;
		var anim = {};
		anim.animationType =  BaseElement.FADE_IN;
		anim.animationValue = 0;
		this.animationStarted = true;
		this.visible = true;
		this.opacity = 0;
		anim.timeToReach = timeToReach;
		anim.offset = Engine.__renderSpeed / Math.abs(timeToReach);
		anim.__callback = callback;
		this.anim.push(anim);
	},

	/*
		Function: fadeOut
		
		
		Fade out animation
		
		Parameters:
		timeToReach - time to reach the end of animation
		callback - callback
	*/
	fadeOut : function(timeToReach, callback){
		if (!this.enabled) return;
		var anim = {};
		anim.animationType =  BaseElement.FADE_OUT;
		anim.animationValue = 255;
		this.animationStarted = true;
		anim.timeToReach = timeToReach;
		anim.offset = Engine.__renderSpeed / Math.abs(timeToReach);
		anim.__callback = callback;
		this.anim.push(anim);
	},


	/*
		Function: goTo
		
		
		Move the base element from the current position to an other
		
		Parameters:
		timeToReach - in ms
		update - if true only x2 and y2 are changed
	*/
	goTo : function(x2, y2, timeToReach, callback){
		if (!this.enabled) return;
		var anim = {};
		this.animationStarted = true;
		anim.animationType = BaseElement.GOTO;
		anim.newX = x2 - this.x;
		anim.newY = y2 - this.y;
		anim.startTime = millis();
		if (timeToReach == undefined) timeToReach = Math.max(this.anim.newX,this.anim.newY) * 2;
		anim.endTime = this.anim.startTime + timeToReach;
		anim.timeToReach = timeToReach;
		anim.startX = this.x;
		anim.startY = this.y;
		if (typeof(callback) == 'function')
			anim.__callback = callback;
		else anim.__callback = null;
		this.anim.push(anim);
	},

	/*
		Function: scaleTo
		
		
		Apply a smoothed scale effect
		
		Parameters:
		newScaleX - end scale X
		newScaleY - end scale Y
		timeToReach - time to reach end of animation
		centered - scale is centered, boolean
		callback - callback
	*/
	scaleTo : function(newScaleX, newScaleY, timeToReach, centered, callback){
		if (!this.enabled) return;
		var anim = {};
		this.animationStarted = true;
		anim.animationType = BaseElement.SCALETO;
		anim.timeToReach = timeToReach;
		anim.offsetX = newScaleX - this.scaling.x;
		anim.offsetY = newScaleY - this.scaling.y;
		anim.newX = newScaleX;
		anim.newY = newScaleY;
		if (centered)
			this.scaling.z = 1;
		else
			this.scaling.z = 0;
		anim.__callback = callback;
		this.anim.push(anim);
	},

	/*
		Function: rotateTo
		
		
		Apply a smoothed rotation effect
		
		Parameters:
		degree - degree
		timeToReach - time to reach the end of animation
		callback - callback
	*/
	rotateTo : function(degree, timeToReach, callback){
		if (!this.enabled) return;
		var anim = {};
		this.animationStarted = true;
		anim.animationType = BaseElement.ROTATETO;
		anim.degree = degree;
		anim.timeToReach = timeToReach;
		anim.offset = radians(this.anim.degree / (this.anim.timeToReach / Engine.__renderSpeed));
		anim.newX = radians(degree);
		anim.__callback = callback;
		this.anim.push(anim);
	},

	/*
		Function: skew
		
		
		Apply a skew effect
		
		Parameters:
		elem - element
		x - x 
		y - y
	*/
	applySkew : function(x, y){
		this.skew = { 'x' : x, 'y' : y}
	},

	/*
		Function: skewTo
		
		
		Apply a smoothed skew effect
		
		Parameters:
		skewX - end skew x
		skewY - end skew y
		timeToReach - time to reach the end of animation
		callback - callback
	*/
	skewTo : function(skewX,skewY, timeToReach, callback){
		if (!this.enabled) return;
		var anim = {};
		this.animationStarted = true;
		anim.animationType = BaseElement.SKEWTO;
		anim.timeToReach = timeToReach;
		if (!this.skew) this.skew = {'x':0,'y':0}
		anim.offsetX = skewX - this.skew.x;
		anim.offsetY = skewY - this.skew.y;
		anim.newX = skewX;
		anim.newY = skewY;
		anim.__callback = callback;
		this.anim.push(anim);
	},

	/*
		Function: timeOut
		
		
		Execute a functor after a minimum delay
		
		Another call to this method on the same object disable the first call
		
		Parameters:
		delay - delay
		callback - callback
	*/
	setTimeOut : function(delay, callback){
		if (!this.enabled) return;
		var anim = {};
		this.animationStarted = true;
		anim.animationType = BaseElement.TIMEOUT;
		anim.offsetX = delay;
		anim.offsetY = millis();
		anim.__callback = callback;
		this.anim.push(anim);
	},

	/*
		Function: advanceBy
		
		
		Advance by one step in a direction taking in count a time line
		
		Parameters:
		x2 - x offset
		y2 - y offset
		timeToReach - if undefined a linear timeline is taken
	*/
	advanceBy : function(x2, y2, timeToReach){
		if (!timeToReach) timeToReach = Math.max(Math.abs(x2), Math.abs(y2));
		var tmp = Engine.__renderSpeed / Math.abs(timeToReach);
		this.setPos(this.x + x2 * tmp, this.y + y2 * tmp);
	},

	/*
		Function: stop
		
		
		Stop the current animation
		
	*/
	stopAnimation : function(){
		this.animationStarted = false;
		this.animationType = -1;
		this.offset = 0;
		this.animationValue = 0;
		this.offsetX = 0;
		this.offsetY = 0;
		this.newX = 0;
		this.newY = 0;
	},



	/*
		Function: isOver
		
		
		Return true if the mouse is over the instanciated base element
		
	*/	
	isOver : function(){
		var w = window;
		if (this.boundingBox[4] == BaseElement.RECT){
			var tmpX = this.x + Engine.currentArea.x;
			var tmpY = this.y + Engine.currentArea.y;
			return ((tmpX + this.boundingBox[0]) <= w.mouseX && (tmpY + this.boundingBox[1]) <= w.mouseY && w.mouseX <= (tmpX + this.boundingBox[2]) &&  w.mouseY <= (tmpY + this.boundingBox[3]));
		}else if (this.boundingBox[4] == BaseElement.CIRCLE){
			return Functions.fastDistance(this.x + this.translatedX, this.y + this.translatedY, w.mouseX, w.mouseY) <= this.boundingBox[0] * this.boundingBox[0];
		}
	},

	/*
		Function: setRotationCenter
		
		
		Default center of the image
		
		Parameters:
		x - x pos
		y - y pos
	*/
	setRotationCenter : function(x, y){
		this.translatedX = x;
		this.translatedY = y;
	},

	/*
		Function: rotateToDirection
		
		
		Apply a rotation angle to facing in (x,y) direction
		
		Parameters:
		x - x pos
		y - y pos
	*/
	rotateToDirection : function(x,y){
		this.setRotation(Functions.polarAngle(this.x - x, this.y - y),true);
	},

	/*
		Function: setBoundingBox
		
		
		Change bounding box standard properties
		
		Parameters:
		xPos - relative to the baseElement
		yPos - relative to the baseElement
		bWidth - width
		bHeight - height
	*/
	setBoundingBox : function(xPos, yPos, bWidth, bHeight){
		this.boundingBox[0] = xPos;
		this.boundingBox[1] = yPos;
		this.boundingBox[2] = bWidth;
		this.boundingBox[3] = bHeight;
		this.boundingBox[4] = BaseElement.RECT;
	},

	/*
		Function: 
		
		
		Transform the standard rect boundingbox into a circle bounding box, for hit function and isOver function
		
		Parameters:
		radius - radius
	*/
	setCircleBoundingBox : function(radius){
		this.boundingBox[4] = BaseElement.CIRCLE;
		this.boundingBox[0] = radius;
	},

	/*
		Function: 
		
		
		Center the element at (x,y)
		
		Parameters:
		x - x pos
		y - y pos
	*/
	centerOn : function(x, y){
		this.setPos(x- (this.width >>> 1),y - (this.height >>> 1));
	},

	/*
		Function: 
		
		
		Execute a function on next frame
		
		Parameters:
		arguments[0] - functor
		arguments[1..x] - params, optional
	*/
	doAfter : function(){
		var args = [];
		for (var i = 1; i < arguments.length; i++){
			args[i - 1] = arguments[i];
		}
		this.changementStack.push({"fonc":arguments[0], "args" : [args]});
	},

	/*
		Function: attachTo
		
		
		Attach the element to an other, at each computed frame the element will take the owner top left position
		
		Parameters:
		owner - owner
	*/
	attachTo : function(owner){
		this.owner = { 'elem' : owner, 'offsetX' : 0, 'offsetY' : 0};
	},

	/*
		Function: detach
		
		
		Detach the element attached to another element
		
	*/
	detach : function(){
		this.owner = null;
	},

	/*
		Function: addShadow
		
		
		Paraments:
		blur - blur width
	*/
	addShadow : function(offsetX, offsetY, blur, c){
		this.shadow = {
			offX:offsetX,
			offY:offsetY,
			'blur' : blur,
			'color' : c.toString()
		}
	},

	/*
		Function: addShadow
		
		
	*/
	removeShadow : function(){
		this.shadow = null;
	},

	/*
		Function: reflection
		
		
		Parameters:
		height - shadow height
		startOpacity - opacity
		gradientColor - color gradient obtained with makeGradient function
	*/
	addReflection : function(height, startOpacity, gradientColor){
		c1 = color(gradientColor.r,gradientColor.g,gradientColor.b,0);
		c2 = color(gradientColor.r,gradientColor.g,gradientColor.b,1);
		this.reflection = { 'height' : height, 'opacity' : startOpacity, 'c1' : c1, 'c2' : c2 }
	},

	/*
		Function: getPixels
		
		
		Get pixels form an element
		
	*/
	getPixels : function(){
		var bufferCanvas = document.createElement('canvas');
		bufferCanvas.width = Engine.width;
		bufferCanvas.height = Engine.height;
		bufferCanvas.webkitImageSmoothingEnabled = true;
		bufferCanvas.mozImageSmoothingEnabled = true;
		var context = bufferCanvas.getContext('2d');
		var savedContext = Engine.context;
		Engine.context = context;
		this.draw();
		Engine.context = savedContext;
		return context.getImageData(this.x, this.y, this.width, this.height).data;
	},

	/*
		Function: setPixels
		
		
		When setting pixels your element is converted to a BufferedDrawable
		
		Parameters:
		pixels - pixels array
	*/
	setPixels : function(pixels){
		var bufferCanvas  = document.createElement('canvas');
		bufferCanvas.width = this.scaledWidth;
		bufferCanvas.height = this.scaledHeight;
		bufferCanvas.webkitImageSmoothingEnabled = true;
		bufferCanvas.mozImageSmoothingEnabled = true;
		var context = bufferCanvas.getContext('2d');
		context.setImageData(0, 0, width, height, pixels);
		this.im = bufferCanvas;
	},

	/*
		Function: pixelScale
		
		
		Offer a way to scale your element by giving pixels dimensions
		
		Parameters:
		width - new width in pixel
		height - new height in pixel
	*/
	pixelScale : function(width, height){
		this.scale(width / this.width, height / this.height);
	},

	/*
		Function: pixelScaleWidth
		
		
		Offer a way to scale width of your element by giving pixels dimensions
		
		Parameters:
		width - new width in pixel
	*/
	pixelScaleWidth : function(width){
		this.scale(width / this.width, -1);
	},

	/*
		Function: pixelScaleHeight
		
		
		Offer a way to scale height of your element by giving pixels dimensions
		
		Parameters:
		height - new height in pixel
	*/
	pixelScaleHeight : function(height){
		this.scale(-1, height / this.height);
	},

	/*
		Function: horizontalFlip
		
		
		Flip horizontaly the element, call again to unflip
		
	*/
	horizontalFlip : function(){
		this.flip.x *= -1;
	},

	/*
		Function: verticalFlip
		
		
		Flip verticaly the element, call again to unflip
		
	*/
	verticalFlip : function(){
		this.flip.y *= -1;
	}
	
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
	Function: setBoundingBox
	*Static*
	
	Change bounding box standard properties
	
	Parameters:
	xPos - relative to the baseElement
	yPos - relative to the baseElement
	bWidth - width
	bHeight - height
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

/*
	Function: horizontalFlip
	*Static*
	
	Flip horizontaly the element, call again to unflip
	
	Parameters:
	elem - element to flip
*/
BaseElement.horizontalFlip = function(elem){
	elem.flip.x *= -1;
}

/*
	Function: verticalFlip
	*Static*
	
	Flip verticaly the element, call again to unflip
	
	Parameters:
	elem - element to flip
*/
BaseElement.verticalFlip = function(elem){
	elem.flip.y *= -1;
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