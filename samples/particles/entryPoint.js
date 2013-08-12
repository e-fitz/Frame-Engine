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
var particle1,particle2,particle3, particle4,particle5;

function setup(){
	Engine.init(true);
	a.init= function(){
		particle1 = new ParticleSystem(new Vector(0,1), 100, ParticleSystem.SEMI_LINEAR, true, new Vector(100,400),2, new Vector(0,-1) , 2000, new Drawable(0,0,"test.png"), 5, 5);
		particle2 = new ParticleSystem(new Vector(0,1), 50, ParticleSystem.SEMI_LINEAR, true, new Vector(300,400), 20, new Vector(0,-1) , 2000, color(0,162,232,1), 5, 5);
		particle3 = new ParticleSystem(new Vector(0,1), 200, ParticleSystem.EXPLOSION, false, new Vector(500,400), 20, new Vector(0,0) , 2000, color(10,16,202,1), 10, 5);
		particle4 = new ParticleSystem(new Vector(3,0), 100, ParticleSystem.SEMI_LINEAR, true, new Vector(500,400), 4, new Vector(2,0) , 2000, color(100,230,232,1), 8, 5);
		particle5 = new ParticleSystem(new Vector(3,0), 50, ParticleSystem.SEMI_EXPLOSION, true, new Vector(300,600), 4, new Vector(-6,0) , 2000,  color(0,100,0,1), 3, 5);
		
		a.addDrawable(1,particle1);
		a.addDrawable(2,particle2);
		a.addDrawable(1,particle3);
		a.addDrawable(1,particle4);
		a.addDrawable(1,particle5);
		particle5.play();
		particle4.play(); 
		particle3.play();
		particle2.play();
		particle1.play();
	}
	Engine.setCurrentArea(a);
	Engine.setAlwaysRefresh(true);
}

a.afterRender = function(){
	if (particle3.stopped())
		particle3.play(); 
}