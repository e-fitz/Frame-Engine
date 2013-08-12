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
var a = new Area();
var d, mur1,mur2,mur3,mur4;


function setup(){
	Engine.init(true);
	a.init = function(){
		
		Library.addImage("images/bubble.png");
		
		for (var i = 1; i <= 5; i++){
			var tmp = new Bubulle(i*110 + 100,200,"images/bubble.png",15);
			tmp.move(random(-1,1),1, 15, 10);
			a.addDrawable(1,tmp);
		}
		mur1 = new PhysicEntity(0,Engine.height -100,0, "", Engine.width, 100);
		a.addDrawable(1,mur1);
		mur2 = new PhysicEntity(0,0,0, "", 100, Engine.height);
		a.addDrawable(1,mur2);
		mur3 = new PhysicEntity(0,0,0, "", Engine.width, 100);
		a.addDrawable(1,mur3);
		mur4 = new PhysicEntity(Engine.width - 100,0,0, "", 100, Engine.height);
		a.addDrawable(1,mur4);

		a.setGravity(0.5);
	};
	
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(a);
	Engine.setBackgroundColor(255,255,255);
}

var Bubulle = PhysicEntity.extend({
	constructor : function(x, y, path, w){
		this.base(x,y,w,path);
	},

	onMouseDown : function(){
		if (mouseX > this.x + this.translatedX)
			this.move(-1,-1, 20,50);
		else
			this.move(1,-1, 20,50);
	},
	
	onMouseUp : function(){},
	/**
		Invocated when mouse enter on the element
	**/
	mouseEnter : function(){
		Input.setCursor('pointer');
	},
	
	/**
		Invocated when mouse leave the element
	**/
	mouseLeave : function(){
		Input.restoreDefaultCursor();
	},
	
	/**
		Invocated when mouse is over
	**/
	mouseOver : function(){
		
	}
});