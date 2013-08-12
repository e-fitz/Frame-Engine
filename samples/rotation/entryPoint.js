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

var d = new ArrayList();

function setup(){
	Engine.init( true);
	a.init = function(){
		for (var i = 0; i < 50; i++){
			d.add(new Drawable(random(0,Engine.width-100),random(0,Engine.height - 100),"images/bubble.png"));
			a.addDrawable(1,d.get(i));
			d.get(i).setRotation(random(-1,1));
		}
	}
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(a);
	Engine.setBackgroundColor(color(255,255,255));
}

a.beforeRender = function (){
	for (var i = 0; i < 50; i++){
		if (d.get(i).angle > 0)
			d.get(i).setRotation(degrees(d.get(i).angle) + 1);
		else
			d.get(i).setRotation(degrees(d.get(i).angle) - 1);
	}
}
