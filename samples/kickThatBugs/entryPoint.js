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
var point = 0;
var pre = 0;
var t = new Timer(2000);
var fire;
var bugCount = 0;
var arbre;

function setup(){
	Engine.init(true, 1024,682);
	Engine.setAlwaysRefresh(true);
	
	Engine.setCurrentArea(a);
}

a.init = function(){
	a.setAsScreen(true);
	arbre = new Drawable(0,0,"images/layer1.png");
	a.addDrawable(2,new Drawable(0,0,"images/background.jpg"));
	a.addDrawable(0,arbre);
	
	fire = new AnimatedDrawable(2, 2, "images/anim.png", 64,64, 20);
	fire.hide();
	AnimatedDrawable.setSequences(fire,[[0,14]]);
	AnimatedDrawable.setAutoAnimated(fire,false);
	
	for (var i = 0; i < 5; i++){
		a.addDrawable(1,newBug());
	}
	
	a.addDrawable(0,fire);
	Input.setCursorImage(new Drawable(0,0,"images/aim.png"));
}

a.beforeRender = function (){
	if (t.itsTime()){
		a.addDrawable(1,newBug());
	}
}

function newBug(){
	
	var tmp = floor(random(1,3));
	if (tmp == 3)
		var bug = new Bug(floor(random(0,7)),floor(random(0,4)),"images/bug"+tmp+".png",118,83,40);
	else if (tmp < 3)
		var bug = new Bug(floor(random(0,7)),floor(random(0,4)),"images/bug"+tmp+".png",0,0,0);
	
	bug.setCheckPoint([new CheckPoint(floor(random(0,1000)),floor(random(0,700))),new CheckPoint(floor(random(0,1000)),floor(random(0,700))),new CheckPoint(floor(random(0,1000)),floor(random(0,700))),new CheckPoint(floor(random(0,1000)),floor(random(0,700)))],floor(random(500,2500)));
	
	bug.mouseDown = function(){
		point += 5;
		BaseElement.stop(bug); 
		bug.remove();
		BaseElement.fadeOut(bug,500);
		fire.show();
		BaseElement.centerOn(fire, mouseX,mouseY);
		AnimatedDrawable.playSequence(fire,0, function(){this.hide();});
		bugCount--;
		bug.mouseDown = function(){};
	};
	
	bugCount++;
	return bug;
}

var finished = false;

var Bug = Entity.extend({
	
	constructor: function(x, y, imName, sWidth, sHeight, sSpeed){
		this.base(x,y,imName,sWidth,sHeight,sSpeed);
	},
	
	mouseDown:function(){},
	mouseUp:function(){}
	
});
