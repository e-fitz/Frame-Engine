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
	Engine.init(true);

	area.init = function(){
		var tmp = new Drawable(100,100, "images/bubble.png");
		BaseElement.reflection(tmp,70,0.5, color(0,0,0));
		area.addDrawable(1, tmp);
	};
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(area);
}
