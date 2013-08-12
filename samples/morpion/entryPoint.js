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
// One area by page
var a = new Area();
var l = new Array();
var room;

function setup(){
	Engine.init(true);
	a.init = function(){
		room = new Room("morpion", 300);
		
		Library.addImage("images/case.jpg");
		Library.addImage("images/croix.png");
		Library.addImage("images/rond.png");
		Library.addSound("medias/bip.mp3");

		for (var i = 0; i < 3; i++){
			l[i] = new Array();
			for (var j = 0; j < 3; j++){
				l[i][j] = new Piece(Engine.width/2 - 40*3 + i*40,Engine.height/2 - 40*3 + j*40,"images/case.jpg", i * 3 + j);
				a.addDrawable(1,l[i][j]);
			}
		}
		
		room.setMessagesHandler('pos', processMessages);
	};
	
	Engine.setCurrentArea(a);
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentRoom(room);
	
}

var artificeDone = false;


function processMessages(messages){
	for (var i = messages.results.length - 1; i >= 0; i--){
		m = l[int(messages.results[i].value / 3)][ messages.results[i].value % 3];
		Drawable.changeImage(b,"images/croix.png");
	}
	
}

var Piece = Drawable.extend({
	
	state : 0,
	
	constructor : function(x, y, imName, num){
		this.base(x,y,imName);
		this.num = num;
	},
	
	onClick : function(){
		if (this.state == 0){
			Drawable.changeImage(this, "images/rond.png");
			this.state = 1;
			Input.setCursor("arrow");
			room.sendMessage('pos',this.num);
			var s = new Sound("medias/bip.mp3");
			s.play();
		}
	},
	
	mouseEnter : function(){},
	
	mouseLeave : function(){
		Input.setCursor('arrow');
	},
	
	mouseOver : function(){
		if (this.state == 0)
			Input.setCursor('pointer');
	}
});