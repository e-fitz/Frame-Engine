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
	draw : function(ec){
		if (this.goTo && !this.animationStarted){
			this.goTo();
		}else if (this.chaseElem && this.chaseElem.enabled && this.chaseElem.state == GameEntity.ALIVE){
			this.chaseMove();
		}
		if (this.keyBoardHandler)
			this.keyBoardHandler();
		this.base(ec);
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