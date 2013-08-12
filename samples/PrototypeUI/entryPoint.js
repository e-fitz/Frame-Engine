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
var starTest = new Entity(0,0,"images/CFHTLS_D3_MegaCam_Region-CFHT_Coelum2.png");
var departPointX = 0; departPointY = 0;
var t = new Timer(100);
var dragAndDrop = 0;

function setup(){
	Engine.init(true,1920,1080);
	Engine.setAlwaysRefresh(true);
	Engine.setCurrentArea(a);
	Engine.setBackgroundColor(255,255,255);
}
a.beforeRender = function (){
	if (t.itsTime()){
		if(dragAndDrop){
			BaseElement.goTo(starTest,starTest.x + mouseX - departPointX,starTest.y + mouseY-departPointY,2);
			departPointX = mouseX;
			departPointY = mouseY;
		}
	}
}
a.init = function(){
	var b = new ColorDrawable(0,0,1624,768,color(124,200,200));
	//this.addDrawable(1,b);
	Library.addImage("animation/chat_animation.png");
	Library.addImage("images/CFHTLS_D3_MegaCam_Region-CFHT_Coelum2.png");
	

	
	
	var form1 = new Form("form1",this);
	
	var val1 = form1.appendInput("text","val1");
	val1.x = 100;
	val1.y = 125;
	var val2 = form1.appendInput("text","val2");
	val2.x = 200;
	val2.y = 125;
	val2.html.style.left = "200px";
	var labResultat = form1.appendElement("p",235,130);
	labResultat.html.innerHTML = "Resultat : ";
	labResultat.html.style.fontSize = "14px";
	labResultat.html.style.color = "red";
	var buttonAction = form1.appendInput("submit","buttonAction",150,150)
	buttonAction.html.value = "Calcule";
	buttonAction.html.onclick = function(){
		var test = form1.post("test_request.php", 
			function(e){
			labResultat.html.innerHTML = "Resultat : " + e;
		});
	};
	var chat = new Entity(100,125,"animation/chat_animation.png",316,200,150);
	starTest.mouseUp = function(){
		dragAndDrop = 0;
	};
	starTest.mouseDown =  function(){
		//starTest.setWidth(5000);
		dragAndDrop = 1;
		departPointX = mouseX;
		departPointY = mouseY;
	};
	this.addDrawable(0,chat);
	this.addDrawable(1,starTest);
}


2815
/** This is high-level function.
 * It must react to delta being more/less than zero.
 */
 var theWidth = 0; var theHeight = 0;
 var zoomOffset = 50;
function handle(delta) {
		if(!theWidth){theWidth = starTest.getWidth()}
		if(!theHeight){theHeight = starTest.getHeight()}
        if (delta < 0)
		{
			theWidth = theWidth + zoomOffset;
			theHeight = theHeight + zoomOffset;
			starTest.pixelScale(theWidth, theHeight);
			//starTest.setWidth(theWidth);
			//starTest.setHeight(theHeight);
		}
        else{
			theWidth = theWidth - zoomOffset;
			theHeight = theHeight - zoomOffset;
			//starTest.setWidth(theWidth);
			//starTest.setHeight(theHeight);
			starTest.pixelScale(theWidth, theHeight);
		}
	}

/** Event handler for mouse wheel event.
 */
function wheel(event){
        var delta = 0;
        if (!event) /* For IE. */
                event = window.event;
        if (event.wheelDelta) { /* IE/Opera. */
                delta = event.wheelDelta/120;
        } else if (event.detail) { /** Mozilla case. */
                /** In Mozilla, sign of delta is different than in IE.
                 * Also, delta is multiple of 3.
                 */
                delta = -event.detail/3;
        }
        /** If delta is nonzero, handle it.
         * Basically, delta is now positive if wheel was scrolled up,
         * and negative, if wheel was scrolled down.
         */
        if (delta)
                handle(delta);
        /** Prevent default actions caused by mouse wheel.
         * That might be ugly, but we handle scrolls somehow
         * anyway, so don't bother here..
         */
        if (event.preventDefault)
                event.preventDefault();
	event.returnValue = false;
}

/** Initialization code. 
 * If you use your own event management code, change it as required.
 */
if (window.addEventListener)
        /** DOMMouseScroll is for mozilla. */
        window.addEventListener('DOMMouseScroll', wheel, false);
/** IE/Opera. */
window.onmousewheel = document.onmousewheel = wheel;