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
var editorArea = new Area();
var editorAreas = [];
var buttontest = 0;
var indexArea = 0;
var progressbarTest = 0;
function setup(){
	Engine.init(false, 840, 480);
	addArea();
	Engine.setCurrentArea(editorArea);
}


editorArea.init = function(){
	var e = new ColorDrawable(0,0, 1000, 649, color(200,200,200, 200));
	editorArea.addDrawable(0,e);

	var textbox1 = new TextBox(500, 300, 100, 25, color(255,255,255), color(0,0,0));
	editorArea.addDrawable(0, textbox1);

}

function addArea(){
	editorAreas[editorAreas.length] = new Area();
	
}

editorArea.afterRender = function(){
if(progressbarTest){
	progressbarTest.value = progressbarTest.value + 0.1;
}
};
	