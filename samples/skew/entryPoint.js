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
var area = new Area();
var img;
var mode = 0;

function setup(){
	Engine.init();
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(area);
}

area.init = function(){
	img = new Drawable(Engine.width * 0.5 - 250, Engine.height * 0.5 - 177, "images/landscape.jpg");
	this.addDrawable(0,img);
	this.addDrawable(0,new  SimpleButton(100,30, 80, 30, color(200,200,200), color(0,0,0), "Color", function(){ mode = 0; }));
	this.addDrawable(0,new  SimpleButton(200,30, 80, 30, color(200,200,200), color(0,0,0), "Grayscale", function(){ mode = 1; }));
	this.addDrawable(0,new  SimpleButton(300,30, 100, 30, color(200,200,200), color(0,0,0), "Black and white", function(){ mode = 2; }));
}
area.afterRender = function(){
	if (mode == 1){
		Filter.grayScale(Engine.width * 0.5 - 250, Engine.height * 0.5 - 177,500,354);
	}else if (mode == 2){
		Filter.blackNWhite(Engine.width * 0.5 - 250, Engine.height * 0.5 - 177,500,354);
	}
}