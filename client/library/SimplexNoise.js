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

	Function: noise
	Apply noise on a value
	
	Parameters:
	val - value to noised
*/
var noise = function (val) {
	var xin = val;
	var yin = val * 2;
	var n0, n1, n2;
	var s = (xin+yin)*noise.F2;
	var i = floor(xin+s);
	var j = floor(yin+s);
	var t = (i+j)*noise.G2;
	var X0 = i-t;
	var Y0 = j-t;
	var x0 = xin-X0;
	var y0 = yin-Y0;
	var i1, j1;
	if(x0>y0) {i1=1; j1=0;}
	else {i1=0; j1=1;}
	var x1 = x0 - i1 + noise.G2;
	var y1 = y0 - j1 + noise.G2;
	var x2 = x0 - 1.0 + 2.0 * noise.G2;
	var y2 = y0 - 1.0 + 2.0 * noise.G2;
	var ii = i & 255;
	var jj = j & 255;
	var gi0 = noise.permMod12[ii+noise.perm[jj]];
	var gi1 = noise.permMod12[ii+i1+noise.perm[jj+j1]];
	var gi2 = noise.permMod12[ii+1+noise.perm[jj+1]];
	var t0 = 0.5 - x0*x0-y0*y0;
	if(t0<0) n0 = 0.0;
	else {
		t0 *= t0;
		n0 = t0 * t0 * noise.dot(noise.grad3[gi0], x0, y0);
	}
	var t1 = 0.5 - x1*x1-y1*y1;
	if(t1<0) n1 = 0.0;
	else {
		t1 *= t1;
		n1 = t1 * t1 * noise.dot(noise.grad3[gi1], x1, y1);
	}
	var t2 = 0.5 - x2*x2-y2*y2;
	if(t2<0) n2 = 0.0;
	else {
		t2 *= t2;
		n2 = t2 * t2 * noise.dot(noise.grad3[gi2], x2, y2);
	}
	return 70.0 * (n0 + n1 + n2);
}

noise.perm = [];
noise.permMod12 = [];
noise.F2 = 0.366025404;
noise.G2 = 0.211324865;
noise.grad3 = [new Vector(1,1),new Vector(-1,1),new Vector(1,-1),new Vector(-1,-1),
					new Vector(1,0),new Vector(-1,0),new Vector(1,0),new Vector(-1,0),
					new Vector(0,1),new Vector(0,-1),new Vector(0,1),new Vector(0,-1)];
noise.dot = function(g, x, y) {
	return g.x*x + g.y*y; 
}
var p = [151,160,137,91,90,15,
	131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
	190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
	88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
	77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
	102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
	135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
	5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
	223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
	129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
	251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
	49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
	138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180];
for(var i=0; i<512; i++) {
	noise.perm[i]=p[i & 255];
	noise.permMod12[i] = (noise.perm[i] % 12);
}
delete p;
