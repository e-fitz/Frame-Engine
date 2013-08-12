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
		var b = new mouvements(0,0,19,19,color(0,0,0));
		this.addDrawable(0,b);
		
	};
	
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(a);
	Engine.setBackgroundColor(255,255,255);
}

var mouvements = ColorDrawable.extend({
	
	beforeProcess : function(){
		if (Input.keysDown[KEY_DOWN]){
			alert('e');
		}
	}
	
});