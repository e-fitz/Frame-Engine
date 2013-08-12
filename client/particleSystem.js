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

	Class: ParticleSystem
	Simple particle system 
*/
var ParticleSystem = BaseElement.extend({

	/* Construtor: ParticleSystem
		Parameters:
		gravity - define a direction where particle are attracted (useful for wind, fountain, soap bubble...) (this vector is always normalized)
		particleCount - particle count
		diffusionType - LINEAR (foutain) or EXPLOSION (explosion) ...
		continuous - if is true then particles are projected continuously (spread on particleLifetime), else particle are all projected in one impulsion, default : false
		position - epicenter
		impulsion - power of impulsion given at each starting particle
		direction - direction given to each particle (noise applyed) (this vector is always normalized)
		particleLifetime - how many time the particle live
		typeColor - a typeColor : a color(r,g,b,a) or ParticleSystem.RANDOM
		size - particle size
		weigth - particle weight
	*/
	constructor : function (gravity, particleCount, diffusionType, continuous, position, impulsion, direction, particleLifetime, typeColor, particleSize, weight){
		this.base(0,0);
		this.started = false;
		this.gravity = gravity.normalize();
		this.diffusionType = diffusionType;
		this.continuous = continuous;
		this.position = position.get();
		this.impulsion = impulsion;
		this.direction = direction.normalize();
		this.particleLifetime = particleLifetime;
		this.typeColor = typeColor;
		this.particleSize = particleSize;
		this.weight = weight;
		this.computeTime = new Timer(40);
		this.particleCount = particleCount;
		this.particleEmissionTime = new Timer(this.particleLifetime / this.particleCount);
		this.alphaCoefficient = 1 / this.particleLifetime;
		var t = this;
		this.particles = new IncreasingArray(function(){	
			var that = t;
			var p = new Particle(that.position, ParticleSystem.noisedValue(that, that.impulsion), ParticleSystem.noisedVector(that, that.direction),that.particleLifetime, 	ParticleSystem.noisedValue(that, that.weight), that.gravity, Math.abs(ParticleSystem.noisedValue(that, that.particleSize)));
			return p;
		});
		if (this.typeColor.instanceName == 'Drawable')
			 this.typeColorKind = ParticleSystem.DRAWABLE;
		this.initSystem();
	},

	/*
		Function: initSystem
		Initialize a particle
	*/
	initSystem : function(){
		if (!this.continuous){
			for (var i = 0; i < this.particleCount; i++){
				var p = this.particles.get();
				Particle.reset(p, this.position.get(), ParticleSystem.noisedValue(this, this.impulsion));
			}
		}
	},
	
	/*
		Function: reset
		Reset the particle, can help to force changing position of the epicenter
	*/
	reset : function(){
		this.particles.clear();
		for (var i = this.particleCount; --i;){
			this.particles.get();
		}
	},
	
	/*
		Function: play
		Start (or restart) the particle system
	*/
	play : function(){
		this.started = true;
		if (this.particles.size() == 0) { 
			this.initSystem();
		}
	},
	
	/*
		Function: stop
		Stop the particle system
	*/
	stop : function(){
		this.started = false;
	},
	
	/*
		Function: stopped
		Return true if the particle system have terminated
	*/
	stopped : function(){
		return this.started == false;
	},
	
	/*
		Function: setColor
		Set the color of the next particles
		
		Parameters:
		c - color
	*/
	setColor : function(c){
		this.typeColor = c;
	},
	
	/*
		Function: setPos
		Set the next position for the epicenter
	*/
	setPos : function(x, y){
		this.position.x = x;
		this.position.y = y;
	},
	
	/*
		Function: draw
	*/
	draw : function(){
		if (!this.started) return;
		
		if (this.typeColor instanceof Drawable && !this.typeColor.isReady()){
			return;
		}
		var i = this.particles.size() ;
		
		if (i == 0 && !this.continuous){ 
			this.started = false;
			return;
		}
		if (this.continuous && i < this.particleCount && this.particleEmissionTime.itsTime()){
			this.particles.get();
			i++;
		}
		var itsTime = this.computeTime.itsTime();
		var tmp;
		var tmpColor;
		var tmpAlpha;
		noStroke();
		
		do{
			tmp = this.particles.get(--i);
			if (tmp == undefined) continue;
			if (itsTime){
				Particle.compute(tmp);
			}
			if (this.typeColorKind == ParticleSystem.DRAWABLE){
				this.typeColor.setPos(tmp.position.x,tmp.position.y);
			}else{
				if (this.typeColor == ParticleSystem.RANDOM)
					tmpColor = getRandomColor();
				else
					tmpColor = this.typeColor;
				tmpAlpha = tmp.remainingTime.getRemainingTime() * this.alphaCoefficient;
				fill(tmpColor.r,tmpColor.g,tmpColor.b, tmpAlpha * 0.5);
				ellipse(tmp.position.x,tmp.position.y, tmp.particleSize);
				fill(tmpColor.r,tmpColor.g,tmpColor.b, tmpAlpha);
				ellipse(tmp.position.x,tmp.position.y, tmp.semiParticleSize);
			}
			
			if (!Particle.isAlive(tmp) || tmpAlpha < 0.15) {
				if (this.continuous) {
					Particle.reset(tmp, this.position.get(), ParticleSystem.noisedValue(this, this.impulsion));
				}else{
					this.particles.disable(i);
				}
			}
		}while (i >= 0);
	}
	
});


/*
		Return a noised value
*/
ParticleSystem.noisedValue = function(elem, value){
	return noise(random(0,5)) * value  + value + random(-elem.diffusionType, elem.diffusionType);
};

/*
	Return a noised values vector
*/
ParticleSystem.noisedVector = function(elem, v){
	return new Vector(ParticleSystem.noisedValue(elem, v.x),ParticleSystem.noisedValue(elem, v.y));
};

/*
	Define one particle
*/
var Particle = Base.extend({
	enabled : true,
	position : 0,
	impulsion : 0,
	direction : 0,
	lifeTime : 0,
	remainingTime : 0,
	weight : 0,
	gravityEffect : 0,
	inverseLifeTime : 0,
	particleSize : 0,
	semiParticleSize : 0,
		
	constructor : function(position, impulsion, direction, particleLifetime, weight, gravity, particleSize){
		this.enabled = true;
		this.position = position.get();
		this.impulsion = impulsion;
		this.direction = direction.get();
		this.lifeTime = particleLifetime;
		this.remainingTime = new TimeAlarm(this.lifeTime, false);
		this.weight = weight;
		this.gravityEffect = new Vector(this.weight * gravity.x,this.weight * gravity.y);
		this.inverseLifeTime = 1 / this.lifeTime;
		this.particleSize = particleSize;
		this.semiParticleSize = particleSize * 0.5;
	},
	
	/* 
		Return true if this particle is enabled
	*/
	isEnabled : function(){
		return this.enabled;
	},


	/*
		Disable this particle
	*/
	disable : function(){
		this.enabled = false;
	},

	/*
		Enable this particle
	*/
	enable : function(){
		this.enabled = true;
	},
	
});

/*
		Compute next position
	*/
Particle.compute = function(elem){
	elem.position.x += elem.impulsion * elem.direction.x + elem.gravityEffect.x;
	elem.position.y += elem.impulsion * elem.direction.y + elem.gravityEffect.y;
	elem.impulsion = elem.impulsion * elem.remainingTime.getRemainingTime() * elem.inverseLifeTime;
};

/*
	Return true if the particle lifeTime instance is finished
*/
Particle.isAlive = function(elem){
	return !elem.remainingTime.itsTime();
};


/*
		Reset the value of a particle
*/
Particle.reset = function(elem, position, impulsion){
	elem.position = position;
	elem.impulsion = impulsion;
	elem.remainingTime.reset();
},

/* Variable: LINEAR */
ParticleSystem.LINEAR = 0.02;
/* Variable: SEMI_LINEAR */
ParticleSystem.SEMI_LINEAR = 0.3;
/* Variable: SEMI_EXPLOSION */
ParticleSystem.SEMI_EXPLOSION = 1;
/* Variable: EXPLOSION */
ParticleSystem.EXPLOSION = 2;
/* Variable: RANDOM */
ParticleSystem.RANDOM = 0;
/* Variable: DRAWABLE */
ParticleSystem.DRAWABLE = 1;