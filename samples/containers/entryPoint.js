/*Copyright (C) 2013 Dourthe Aymeric

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
var ia;
function setup(){
	Engine.init(true);

	area.init = function(){
		ia = new IncreasingArray(pop);
		var tmp = ia.get();
		tmp.setPos(random(0, Engine.width - 100), random(0, Engine.height - 100));
		area.addDrawable(1, tmp);
	};
	Engine.setAlwaysRefresh(true);
	Engine.setBackgroundColor(255,255,255);
	Engine.setCurrentArea(area);
}

var t = new Timer(10);

area.afterRender = function(){
	if (t.itsTime()){
		var tmp = ia.get();
		tmp.setPos(random(0, Engine.width - 100), random(0, Engine.height - 100));
		area.addDrawable(1, tmp);
	}
	fill(0);
	text("Nb elements " + ia.size(),100,100);
	text("Nb disabled " + ia.disabledCount(),100,120);
};

function pop(){
	return new Pop(random(0, Engine.width - 100), random(0, Engine.height - 100), "images/bubble.png");
}

var Pop = Drawable.extend({
	constructor : function(x, y, path){
		this.base(x,y,path);
		this.instanceName = "Pop";
	},
	mouseEnter : function(){
		Input.setCursor("pointer");
	},
	
	mouseLeave : function(){
		Input.setCursor("default");
	},
	
	mouseOver: function(){},
	
	onClick : function(){
		this.mouseLeave();
		ia.disable(this);
	}
});