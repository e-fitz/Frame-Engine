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

	Function: red
	*global*
	
	Return red value from an int color
	
	Parameters:
	intColor - int color
*/
function red(intColor){
	return ((intColor >> 16) & 255) / 255;
}

/*
	Function: green
	*global*
	
	Return green value from an int color
	
	Parameters:
	intColor - int color
*/
function green(intColor){
	return ((intColor >> 8) & 255) / 255;
}

/*
	Function: blue
	*global*
	
	Return blue value from an int color
	
	Parameters:
	intColor - int color
*/
function blue(intColor){
	return (intColor & 255) / 255;
}

/*
	Function: intColor
	*global*
	
	Return an int representation of an rgba color
	
	Parameters:
	r - red
	g - green
	b - blue
	a - alpha
*/
function intColor(r,g,b,a){
	if (a == undefined) a = 255;
	if (r > 255) r = 255;
	if (g > 255) g = 255;
	if (b > 255) b = 255;
	return (a << 24 & 4278190080 | r << 16 & 16711680 | g << 8 & 65280 | b & 255) >>> 0;
}

/*
	Class: color
	*global*
	
	Return a color object containing r, g, b, a, members and toString, hexval functions
	
	Parameters:
	r - red
	g - green
	b - blue
	a - alpha
*/
function color(r,g,b,a){
	if (r > 255) r = 255;
	if (g > 255) g = 255;
	if (b > 255) b = 255;
	return {
		'r' : r,
		'g' : g,
		'b' : b,
		'a' : a,
		toString : function(){
			if (a == undefined){
				return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
			}else{
				return "rgba(" + this.r + "," + this.g + "," + this.b + "," + this.a + ")";
			}
		},
		hexval : (a == undefined)?'rgb(' + r + ',' + g + ',' +  b + ')':'rgba(' +  r + ',' +  g + ',' +  b + ',' +   a + ')'
	};
}

/*
	Function: hexToColor
	*global*
	
	Return a color from an hexadecimal representation rrggbb (i.e. ffbdaf)
	
	Parameters:
	hex - hexadecimal string val
	alpha - optional, alpha channel
*/
function hexToColor(hex,alpha){
	var h=hex.replace('#', '');
	h =  h.match(new RegExp('(.{'+h.length/3+'})', 'g'));
	for(var i=0; i<h.length; i++)
		h[i] = parseInt(h[i].length==1? h[i]+h[i]:h[i], 16);

    if (typeof alpha == 'undefined')  alpha = 1;

	return color(h[0], h[1], h[2], alpha);
}

/*
	Function: fill
	*global*
	
	Change current fill color
	
	Parameters:
	c - color
	context - a context where to draw
*/

/*
	Function: fill
	*global*
	
	Change current fill color
	
	Parameters:
	r - red
	g - green
	b - blue
	a - between 0 and 1, if a > 1 then a / 255
	ec - context where to draw
*/
function fill(r,g,b, a, ec){
	if(typeof(r) == 'object'){
		if (fill.mnemonic[r]) {
			if (g){
				g.fillStyle = fill.mnemonic[r];
			}else{
				Engine.context.fillStyle = fill.mnemonic[r];
			}
		}else{
			fill.mnemonic[r] = r.hexval;
			if (g){
				g.fillStyle = fill.mnemonic[r];
			}else{
				Engine.context.fillStyle = fill.mnemonic[r];
			}
		}
	}else{
		if (a){
			if (a > 1) a *= fill.da;		
			if (a < 0) a = 0;
		}else
			a = 1
		tmp = intColor(r,g,b,a * 255);
		if (fill.mnemonic[tmp]) {
			if (ec){
				ec.fillStyle = fill.mnemonic[tmp];
			}else{
				Engine.context.fillStyle = fill.mnemonic[tmp];
			}
		}else{
			fill.mnemonic[tmp] = color(r,g,b,a).hexval;
			if (ec){
				ec.fillStyle = fill.mnemonic[tmp];
			}else{
				Engine.context.fillStyle = fill.mnemonic[tmp];
			}
		}
	}
	Engine.fill = true;
}
fill.mnemonic = [];
fill.da = 1 / 255;

/*
	Function: noFill
	*global*
	
	Disable filling style
*/
function noFill(){
	Engine.fill = false;
}

/*
	Function: fillGradient
	*global*
	
	Enable gradient filling
	
	Parameters:
	gradient - gradient made with makeGradient
	context - context where to draw
*/
function fillGradient(gradient, c){
	if (c){
		c.fillStyle = gradient;
	}else{
		Engine.context.fillStyle = gradient;
	}
}

/*
	Function: makeGradient
	*global*
	
	Create a linear gradient
	
	Parameters:
	gradientParams -
	
	{ 
	
	startX : x, startY : y, endX : x, endY : y,
	
	colors : [
	
	{ 	col : color(r,g,b),
	
	stopPos : 0.x

	},{ 	col : color(r,g,b),

	stopPos : 0.x

	}]}
*/
function makeGradient(gradientParams){
	var gradient = Engine.context.createLinearGradient(gradientParams.startX,gradientParams.startY,gradientParams.endX,gradientParams.endY);
	for (var i = 0; i < gradientParams.colors.length; i++){
		gradient.addColorStop(gradientParams.colors[i].stopPos,gradientParams.colors[i].col.toString());
	}
	return gradient;
}

/*
	Function: noStroke
	*global*
	
	Disable stroke color
*/
function noStroke(){
	Engine.stroke = false;
}

/*
	Function: stroke
	*global*
	
	Enable stroke color
	
	Parameters:
	c - color
	context - context where to draw
*/

/*
	Function: stroke
	*global*
	
	Enable stroke color
	
	Parameters:
	r - red
	g - green
	b - blue
	a - between 0 and 1, if a > 1 then a / 255
*/
function stroke(r,g,b,a){
	if (typeof(r) == 'object'){
		Engine.stroke = true;
		if (g){
			g.strokeStyle = r.hexval;
		}else{
			Engine.context.strokeStyle = r.hexval;
		}
	}else{
		if (!a) a = 255;
		Engine.stroke = true;
		Engine.context.strokeStyle = color(r,g,b,a).hexval;
	}
}

/*
	Function: stroke
	*global*
	
	Enable stroke color
	
	Parameters:
	c - color
*/



/*
	Function:  rect
	*global*
	
	Draw a rectangle
	
	Parameters:
	x - x pos
	y - y pos
	w - width of the rectangle
	h - height of the rectangle
	corner0 - optional
	corner1 - optional
	corner2 - optional
	corner3 - optional
	context - context where to draw
*/
function rect(x,y,w,h, corner0,corner1,corner2,corner3, c){
	if (corner0 && !corner1){
		corner1 = corner0;
		corner2 = corner0;
		corner3 = corner0;
	}
	x = floor(x);
	y = floor(y);
	w = floor(w);
	h = floor(h);
	if (corner0 != undefined){
		corner0 = floor(corner0);
		corner1 = floor(corner1);
		corner2 = floor(corner2);
		corner3 = floor(corner3);
	}
	if (corner0 != undefined && (corner0 != 0 || corner1 != 0 || corner2 != 0 || corner3 != 0)){
		if (c) 
			var ec = c;
		else
			var ec = Engine.context;
		var xw = x + w;
		var yh = y + h;
		var x0 = x + corner0;
		ec.beginPath();
		ec.moveTo(x0, y);
		ec.lineTo(xw - corner1, y);
		ec.quadraticCurveTo(xw, y, xw, y + corner1);
		ec.lineTo(x + w, yh - corner2);
		ec.quadraticCurveTo(xw, yh, xw - corner2, yh);
		ec.lineTo(x + corner3, yh);
		ec.quadraticCurveTo(x, yh, x, yh - corner3);
		ec.lineTo(x, y + corner0);
		ec.quadraticCurveTo(x, y, x0, y);
		ec.closePath();
		if (Engine.fill){
			ec.fill();
		}
		if (Engine.stroke) {
			ec.stroke();
		}
	}else{
		if (Engine.fill){	
			if (c)
				c.fillRect(x,y,w,h);
			else
				Engine.context.fillRect(x,y,w,h);
		}
		if (Engine.stroke) {
			if (c)
				c.strokeRect(x,y,w,h);
			else
				Engine.context.strokeRect(x,y,w,h);
		}
	}
}

/*
	Function: line
	*global*
	
	Draw a line
	
	Parameters:
	x1 - x of x1 point
	y1 - y of y1 point
	x2 - x2
	y2 - y2
	ec - optional : context where to draw 
*/
function line(x1,y1,x2,y2, ec){
	var ec = Engine.context;
	ec.beginPath();
	ec.moveTo(x1,y1);
	ec.lineTo(x2,y2);
	ec.closePath();
	if (Engine.fill){
		ec.fill();
	}
	if (Engine.stroke) {
		ec.stroke();
	}
}

/*
	Function: lineWidth
	*global*
	
	Change line width, affect line, stroke...
	
	Parameters:
	w - width
	c - optional : context where to apply
*/
function lineWidth(w, c){
	if (c){
		c.lineWidth = w;
	}else{
		Engine.context.lineWidth = w;
	}
}

/*
	Function: dashedLine
	*global*
	
	Draw a dashedLine
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
	dashArray - optional array
	c - optional : context where to draw
*/
function dashedLine(x1,y1,x2,y2, dashArray, c){
	if (c)
		var ec = c;
	else
		var ec = Engine.context;

    if(!dashArray) dashArray=[10,5]; 
    var dashCount = dashArray.length; 
    var dx = (x2 - x1); 
    var dy = (y2 - y1); 
    var xSlope = (Math.abs(dx) > Math.abs(dy)); 
    var slope = (xSlope) ? dy / dx : dx / dy; 
	ec.beginPath();
    ec.moveTo(x1, y1); 
    var distRemaining = Math.sqrt(dx * dx + dy * dy); 
    var dashIndex = 0; 
    while(distRemaining >= 0.1){ 
        var dashLength = Math.min(distRemaining, dashArray[dashIndex % dashCount]); 
        var step = Math.sqrt(dashLength * dashLength / (1 + slope * slope)); 
        if(xSlope){ 
            if(dx < 0) step = -step; 
            x1 += step 
            y1 += slope * step; 
        }else{ 
            if(dy < 0) step = -step; 
            x1 += slope * step; 
            y1 += step; 
        } 
		if(dashIndex % 2 == 0)
			ec.lineTo(x1, y1);
		else
			ec.moveTo(x1, y1); 
        distRemaining -= dashLength; 
        dashIndex++; 
    } 
	ec.closePath();
	if (Engine.fill){
		ec.fill();
	}
	if (Engine.stroke) {
		ec.stroke();
	}
}

/*
	Function: ellipse
	*global*
	
	Draw an ellipse
	
	Parameters:
	x - x
	y - y
	radius - radius
	c - optional : context where to draw
*/
function ellipse(x,y,radius, c){
	x = floor(x);
	y = floor(y);
	radius = floor(radius);
	if (c)
		var ec = c;
	else
		var ec = Engine.context;
	ec.beginPath();
	ec.arc(x, y, radius, 0, Math.PI * 2, true);
	if (Engine.fill){
		ec.fill();
	}
	if (Engine.stroke){
		ec.stroke();
	}
	ec.closePath();
}

/*
	Function: image
	*global*
	
	Draw an image
	
	Parameters:
	im - image to draw
	sx - source x
	sy - source y
	sw - source width
	sh - source height
	dx - destination x
	dy - destination y
	dw - destination width
	dh - destination height
	c - optional : contexte where to draw
*/
function image(im, sx, sy, sw, sh, dx, dy, dw, dh, c){
	sx = floor(sx);
	sy = floor(sy);
	sw = floor(sw);
	sh = floor(sh);
	dx = floor(dx);
	dy = floor(dy);
	dw = floor(dw);
	dh = floor(dh);
	if (!c)
		var c = Engine.context;
	if (arguments.length == 9)
		c.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
	else if (arguments.length == 5)
		c.drawImage(im, sx, sy, sw, sh);
	else if (arguments.length == 3)
		c.drawImage(im, sx, sy);
}

/*
	Function: text
	*global*
	
	Draw text
	
	Parameters:
	t - text
	x - x
	y - y
	c - optional : contexte where to draw
*/
function text(t,x,y, c){
	x = floor(x);
	y = floor(y);
	if (c)
		c.fillText(t,x,y);
	else
		Engine.context.fillText(t,x,y);
}

/*
	Function: textSize
	*global*
	
	Change text size
	
	Parameters:
	s - size
	c - optional : contexte where to draw
*/
function textSize(s, c){
	if (c)
		c.font = s + "px sans-serif";
	else
		Engine.context.font = s + "px sans-serif";
}

/*
	Function: textWidth
	*global*
	
	Return text width
	
	Parameters:
	t - text
*/
function textWidth(t){
	return Engine.context.measureText(t).width;
}

/*
	Function: random
	*global*
	
	Return a random value between min and max
	
	Parameters:
	min - min
	max - max
*/
function random(min,max){
	return Math.random()*(max - min + 1)+min;
}

/*
	Function: millis
	*global*
	
	Return current timestamp

*/
var millis = Date.now || function(){
	return (new Date()).getTime();
}

/*
	Function: degrees
	*global*
	
	Return degree value of a radians angle
	
	Parameters:
	val - radian angle
*/
function degrees(val){
	return val * degrees.mnemonic;
}
degrees.mnemonic = 180 / Math.PI;

/*
	Function: radians
	*global*
	
	Return radian value of a degree angle
	
	Parameters:
	val - degree angle
*/
function radians(val){
	return val * radians.mnemonic;
}
radians.mnemonic = Math.PI / 180;

/*
	Function: floor
	*global*
	
	Fast floor for positive number only
	
	Parameters:
	val - value to floor
*/
function floor(val){
	if (val > 0)
		return val | 0;
	else
		return Math.floor(val);
}

/*
	Function: setOpacity
	*global*
	
	Change drawing opacity 
	
	Parameters:
	val - between 0 to 1
	c - optional : contexte where to draw
*/
function setOpacity(val, c){
	if (val > 1) val = val * 0.01
	if (c)
		c.globalAlpha = val; 
	else
		Engine.context.globalAlpha = val; 
}

/*
	Function: getRandomColor
	*global*
	
	Return a random color
*/
getRandomColor = function(){
	return color(random(0,255),random(0,255),random(0,255));
}



/**
	Set current displaying language
	languageCode : 'FR', 'EN', 'ES', 'IT'...
**/
function setLanguage(languageCode){
	storage.setItem('language', languageCode.toUpperCase());
}

/**
	ASCII String without space
**/
function addText(languageCode, key, value){
	key = key.replace(/ /g,'_');
	translations.put(key.toUpperCase() + languageCode.toUpperCase(), value);
}

/**
	Return text translation for a specified key
**/
function __text(key){
	return translations.get(key.toUpperCase() + storage.getItem('language'));
}