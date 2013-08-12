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
/**
	First demo, this one dont use any database 

**/

var a = new Area();

var p;

var b;
var particleCount = 20,lifeTime = 2000;
var impulsion = 10, sized = 3, weight = 1.5;
var gravity = new Vector(0,1), dir = new Vector(0,-1);
var diffusion = 0.02;
var continuous = true;
var c = color(255,127,39,0);


function setup(){
	Engine.init(false);
	a.init = function(){
		
		p = new ParticleSystem(gravity, particleCount,diffusion, continuous, new Vector(Engine.width * 0.5,Engine.height * 0.5),impulsion, dir, lifeTime, c, sized, weight);
		a.addDrawable(1,p);
		p.play();
		
		b = new ArrayList();
		
		b.add(new SimpleButton(Engine.width - 120, 10, 90, 20, color(180,180,180), color(0,0,0), "particles ++",function(){
			particleCount++;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 35, 90, 20, color(180,180,180), color(0,0,0), "particles --",function(){
			if (particleCount == 0) return;
			particleCount--;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 60, 90, 20, color(180,180,180), color(0,0,0), "impulsion ++",function(){
			impulsion+=0.2;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 85, 90, 20, color(180,180,180), color(0,0,0), "impulsion --",function(){
			if (impulsion == 0) return;
			impulsion-=0.2;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 110, 90, 20, color(180,180,180), color(0,0,0), "size ++",function(){
			sized+=0.2;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 135, 90, 20, color(180,180,180), color(0,0,0),"size --",function(){
			if (impulsion == 0) return;
			sized-=0.2;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 160, 90, 20, color(180,180,180), color(0,0,0), "weight ++",function(){
			weight+=0.2;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 185, 90, 20, color(180,180,180), color(0,0,0), "weight --",function(){
			if (impulsion == 0) return;
			weight-=0.2;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 210, 90, 20, color(180,180,180), color(0,0,0), "lifeTime ++",function(){
			lifeTime+=100;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 235, 90, 20, color(180,180,180), color(0,0,0), "lifeTime --",function(){
			if (impulsion == 0) return;
			lifeTime-=100;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 260, 90, 20, color(180,180,180), color(0,0,0), "diffusion type",function(){
			if (diffusion == 0.02)
				diffusion = 0.3;
			else if (diffusion == 0.3)
				diffusion = 1;
			else if (diffusion == 1)
				diffusion = 2;
			else
				diffusion = 0.02;
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120, 285, 90, 20, color(180,180,180),color(0,0,0), "continuous",function(){
			if (continuous) continuous = false;
			else continuous = true;
			reset_particle();
		}));
		
		b.add(new VectorDrawable(Engine.width * 0.5 + 20,Engine.height * 0.5 + 180,20,20,color(0,255,0),"Gravity"));
		b.get(12).dragStop = function(){
			gravity.x = this.x - p.position.x;
			gravity.y =  this.y - p.position.y;
			console.log(gravity);
			reset_particle();
		}
		
		b.add(new VectorDrawable(Engine.width * 0.5 - 20,Engine.height * 0.5 + 180,20,20,color(0,0,255), "Direction"));
		b.get(13).dragStop = function(){
			dir.x = this.x - p.position.x;
			dir.y =  this.y - p.position.y;
			reset_particle();
		}
		
		b.add(new SimpleButton(Engine.width - 120,310, 90, 20, color(180,180,180),color(0,0,0), "color",function(){
			var tmp = prompt("Type in the color as defined below : ", "R,G,B");
			tmp = tmp.split(",");
			c = color(parseInt(tmp[0],10),parseInt(tmp[1],10),parseInt(tmp[2],10));
			reset_particle();
		}));
		
		b.add(new SimpleButton(Engine.width - 120,335, 90, 20, color(180,180,180),color(0,0,0), "Get PDE string",function(){
			alert("new ParticleSystem(new Vector(" + gravity.x + "," + gravity.y + "), " + particleCount + ", " + diffusion + ", " + continuous  + " , " + " new Vector(Engine.width * 0.5,Engine.height * 0.5), " + impulsion + ", new Vector(" + dir.x + ", " + dir.y + "), " + lifeTime + ",  new Gradient( " + "color (" + c.r + "," + c.g  + ","  + c.b + "), color (" + c.r + "," + c.g  + ","  + c.b + ") ), " + sized + ", " +weight + ");");
		}));
		
		
		for (var i = b.size() - 1; i>=0; i--){
			a.addDrawable(1, b.get(i));
		}
		
	};
	
	Engine.setCurrentArea(a);
	Engine.setAlwaysRefresh(true);
	Engine.setBackgroundColor(255,255,255);
}

function reset_particle(){
	p.remove();
	p =  new ParticleSystem(gravity, particleCount, diffusion, continuous, new Vector(Engine.width * 0.5,Engine.height * 0.5),impulsion, dir, lifeTime, c, sized, weight);
	a.addDrawable(1,p);
	p.play();
}

a.beforeRender = function(){
	if (p.stopped()) p.play();
};


a.afterRender = function(){
	fill(0);
	text("particles count : " + particleCount , 10,20);
	text("impulsion : " + impulsion , 10,35);
	text("size : " + sized , 10,50);
	text("weight : " + weight , 10,65);
	text("lifeTime : " + lifeTime , 10,80);
	text("color : " + c.r + "," + c.g  + ","  + c.b + ")" , 10,95);
	
	if (diffusion == 0.02)
		text("diffusion : linear " , 10,110);
	else if (diffusion == 0.3)
		text("diffusion : semi linear " , 10,110);
	else if (diffusion == 1)
		text("diffusion  : semi explosion " , 10,110);
	else
		text("diffusion : explosion" , 10,110);
	if (continuous)
		text("continuous : yes" , 10,125);
	else
		text("continuous : no" , 10,125);
};


var VectorDrawable = ColorDrawable.extend({
	constructor : function(x, y, width, height, c, t) {
		this.base(x,y,width,height,c);
		this.setShape(1);
		this.t = t;
		BaseElement.enableDraggable(this);
	},

	mouseEnter : function(){
		Input.setCursor("pointer");
	},
	
	/**
		Invocated when mouse leave the element
	**/
	mouseLeave : function(){
		Input.restoreDefaultCursor();
	},

	draw : function(ec){
		this.base(ec);
		fill(0,0,0,1);
		text(this.t,-10,this.height * 0.65);
	},
	
	/**
		Invocated when mouse is over
	**/
	mouseOver : function(){},

	dragStop : function(){}
	
});