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