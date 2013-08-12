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
var v;
var mode = 0;

function setup(){
	Engine.init();
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(area);
}

area.init = function(){
	v = new VideoDrawable(Engine.width * 0.5 - 250, Engine.height * 0.5 - 177, "videos/particles", 200, 123);
	v.loop(true);
	v.play();
	this.addDrawable(0,v);
	BaseElement.rotateTo(v, 360, 10000);
	BaseElement.scaleTo(v,0.5,0.5,5000, true, function(){
		BaseElement.scaleTo(v, 1, 1, 5000, true);
	});
}


area.afterRender = function(){
	if (v.rightBound > Engine.width)
		v.setPosX(0);
	else
		v.setPosX(v.x + 1);
}