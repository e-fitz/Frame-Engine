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

function setup(){
	Engine.init();
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(area);
}

area.init = function(){
	var u = new UIDrawable(100,100,100,50);
	u.addBackgroundColor(color(100,0,0));
	u.addBorder(2,color(255,255,255),0,10,0,10);
	u.addBackgroundImage("images/bg.png",0,-30);
	u.addChild(new ColorDrawable(5,5,20,20,color(0,0,255)));
	//u.scale(0.5,0.3);
	u.setOverflowBehavior = UIDrawable.HIDDEN;
	this.addDrawable(0,u);
}
