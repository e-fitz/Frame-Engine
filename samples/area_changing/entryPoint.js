/**
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

	First demo, this one dont use any database 

**/

var a1 = new Area();
var a2 = new Area();
var d1, d2;
var current = 0;

function setup(){
	Engine.init(true);
	Engine.setCurrentArea(a1);
	Engine.setAlwaysRefresh(true);
	Engine.setBackgroundColor(255,255,255);
}
a1.init = function(){
	d1 = new Drawable(0,0,"images/im1.jpg");
	a1.addDrawable(1, d1);
	a1.addDrawable(1,  new SimpleButton(Engine.width / 2 - 50, Engine.height / 2, 100,20,color(180,180,180),color(0,0,0), "Change area",function(){
		Engine.changeArea(a2);
	}));
}
a2.init = function(){
	d2 = new Drawable(0,0,"images/im2.jpg");
	a2.addDrawable(1, d2);
	a2.addDrawable(1,new SimpleButton(Engine.width / 2 - 50, Engine.height / 2, 100,20,color(180,180,180),color(0,0,0), "Change area",function(){
		Engine.changeArea(a1);
	}));
		
}