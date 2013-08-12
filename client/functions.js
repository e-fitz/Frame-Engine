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

	Class: Functions
	Usefull static functions
*/
function Functions(){
	this.instanceName = "Functions";
	/*
		Return true if a function is declared into an object
	*/
}

/*
	Function: getDebugMode
	*static*
	
	Return true if the debug mode is enabled
*/
Functions.getDebugMode = function(){
	return DEBUG_MODE;
}

/*
	Function: functionExists
	*static*
	
	Return true if a function exist within an object
	
	Parameters:
	yourFunctionName - function name
	obj - obj containing (or not) the function
*/
Functions.functionExists = function(yourFunctionName, obj){
	return (yourFunctionName in obj);
}

/*
	Function: getObjectClass
	*static*
	
	Return the class name of an object
	
	Parameters:
	obj - object instance
*/
Functions.getObjectClass = function(obj) {
	if (obj && obj.constructor && obj.constructor.toString) {
		var arr = obj.constructor.toString().match(/function\s*(\w+)/);
		if (arr && arr.length == 2) {
			return arr ;
		}
	}

	return "undefined";
}
	
/*
	Function: intersect
	*static*
	
	Check if this element hit an other element, by bounding box
	
	Parameters:
	b1 - element
	b2 - element
*/
Functions.intersect = function(b1, b2){
	return ((b1.x < b2.rightBound)
	&& (b1.rightBound > b2.x)
	&& (b1.y < b2.bottomBound)
	&& (b1.bottomBound > b2.y));
}


/*
	Function: rotate
	*static*
	
	Rotate a vector by an angle
	
	Parameters:
	v - vector
	theta - angle in radian
	
	Return: return the vector v
*/
Functions.rotate = function(v, theta){
	var xTemp = v.x;
	v.x = v.x*cos(theta) - v.y*sin(theta);
	v.y = xTemp*sin(theta) + v.y*cos(theta);
	return v;
}

/*
	Function: points2Line
	*static*
	
	Return a vector reprensenting the line formed by two points
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
*/
Functions.points2Line = function(x1, y1, x2, y2){
	var a = (y2 - y1 ) / (x2 - x1);
	return new Vector(a,y1 - a * x1);
}

/*
	Function: pointInSquare
	*static*
	
	Check if a point is inside a square
	
	Parameters:
	x1 - x1 point
	y1 - y1 point
	x2 - x2 top left square corner
	y2 - y2 top left square corner
	width - square width
	height - square height
*/
Functions.pointInSquare = function(x1, y1, x2, y2, width, height){
	return (x1 >= x2 && y1 >= y2 && x1 <= x2 + width && y1 <= y2 + height);
}

/*
	Function: interset
	*static*
	
*/
Functions.intersect = function(x1, y1, x2, y2, x3, y3, x4, y4){
		var a1, a2, b1, b2, c1, c2;
		var r1, r2 , r3, r4;
		var denom, offset, num;

		/* Compute a1, b1, c1, where line joining points 1 and 2
		  is "a1 x + b1 y + c1 = 0". */
		a1 = y2 - y1;
		b1 = x1 - x2;
		c1 = (x2 * y1) - (x1 * y2);

		/* Compute r3 and r4. */
		r3 = ((a1 * x3) + (b1 * y3) + c1);
		r4 = ((a1 * x4) + (b1 * y4) + c1);

		/* Check signs of r3 and r4. If both point 3 and point 4 lie on
		 same side of line 1, the line segments do not intersect. */
		if ((r3 != 0) && (r4 != 0) && Functions.same_sign(r3, r4)){
		return null;
		}

		/* Compute a2, b2, c2 */
		a2 = y4 - y3;
		b2 = x3 - x4;
		c2 = (x4 * y3) - (x3 * y4);

		/* Compute r1 and r2 */
		r1 = (a2 * x1) + (b2 * y1) + c2;
		r2 = (a2 * x2) + (b2 * y2) + c2;

		/* Check signs of r1 and r2. If both point 1 and point 2 lie
		 on same side of second line segment, the line segments do
		 not intersect. */
		if ((r1 != 0) && (r2 != 0) && (Functions.same_sign(r1, r2))){
		return null;
		}

		/* Line segments intersect: compute intersection point. */
		denom = (a1 * b2) - (a2 * b1);

		if (denom == 0) {
		return null;
		}

		if (denom < 0){ 
	offset = -denom / 2; 
	} 
	else {
	offset = denom / 2 ;
	}

	/* The denom/2 is to get rounding instead of truncating. It
	 is added or subtracted to the numerator, depending upon the
	 sign of the numerator. */
	num = (b1 * c2) - (b2 * c1);
	if (num < 0){
	x = (num - offset) / denom;
	} 
	else {
	x = (num + offset) / denom;
	}

	num = (a2 * c1) - (a1 * c2);
	if (num < 0){
	y = ( num - offset) / denom;
	} 
	else {
	y = (num + offset) / denom;
	}

	/* lines_intersect */
	return new Functions.$p.PVector(x,y);
}

Functions.same_sign = function(a, b){
  return (( a * b) >= 0);
}

/*
	Function: distance
	*static*
	
	Return the distance between two point
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
*/
Functions.distance = function(x1, y1, x2, y2){
	return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
}

/*
	Function: fastDistance
	*static*
	
	Distance without final square root
	
	Parameters:
	x1 - x1
	y1 - y1
	x2 - x2
	y2 - y2
*/
Functions.fastDistance = function(x1, y1, x2, y2){
	var t1 = (x1 - x2), t2 = (y1 - y2);
	return t1*t1 + t2*t2;
}

/*
	Function: polarAngle
	*static*
	
	Return the polar angle for the given vector (x,y)
	
	Parameters:
	x - x
	y - y
*/
Functions.polarAngle = function(x, y){
	if (x > 0 && y >= 0){
		return Math.atan(y/x);
	}else if (x > 0 && y < 0){
		return Math.atan(y/x) + Math.PI * 2;
	}else if (x < 0){
		return Math.atan(y / x) + Math.PI;
	}else if (x == 0 && y > 0){
		return Math.PI * 0.5;
	}else if (x == 0 && y < 0){
		return (Math.pi * 3) * 0.5;
	}
}

/*
	Function: sanitize
	*static*
	
	Sanitize a string
	
	Parameters:
	string - string to sanitize
	
	Return: sanitized string
*/
Function.sanitize = function(string){
	return string.replace(Function.sanitize.regex,'');
}
Function.sanitize.regex = /[^a-zA-Z 0-9]+/g;

Functions.prototype.constructor = Functions;