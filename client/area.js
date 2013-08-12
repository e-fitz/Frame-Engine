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
		if (d.mouseUp)
			Engine.addClickHandler(d);
		if (d.mouseDown)
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
						if (!tmp.__toRestore){
							ec.save();
							tmp.__toRestore = true;
						}
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
					if (tmp.flip.x != 1 || tmp.flip.y != 1){
						if (!tmp.__toRestore){
							ec.save();
							tmp.__toRestore = true;
						}
						if (tmp.flip.x == -1){
							ec.translate(tmp.x * 2 + tmp.getWidth(),0);
						}
						if (tmp.flip.y == -1){
							ec.translate(0,tmp.y * 2 + tmp.getHeight());
						}
						ec.scale(tmp.flip.x,tmp.flip.y);
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

				if (tmp.__toRestore) {
					tmp.__toRestore = false;
					ec.restore();
				}
				
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
