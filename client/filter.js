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

	Class: Filter
	Provide static function to apply filter on the screen or on a BufferedDrawable
*/
var Filter = {}

/*
	Function: grayScale
	Apply gray scale filter
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.grayScale = function(x,y,width,height, bufferedImage) {
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, avg = 0;
	do{
		i -= 2;
		avg = (imgData.data[i] + imgData.data[i-1] + imgData.data[i-2]) * Filter._1Over3;
		imgData.data[i]= avg;
		imgData.data[--i]= avg;
		imgData.data[--i]= avg;
	  
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y); 
}
Filter._1Over3 = 1 / 3;

/*
	Function: blackNWhite
	Apply black and white filter
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	threshold - between 0 and 255, if undefined 127 is taken
	bufferedImage - optional BufferedDrawable
*/
Filter.blackNWhite = function(x,y,width,height, threshold, bufferedImage) {
	if (threshold == undefined) threshold = 127;
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, avg = 0;
	do{
		i -= 2;
		avg = (imgData.data[i] + imgData.data[i-1] + imgData.data[i-2]) * Filter._1Over3;
		if (avg > threshold) avg = 255;
		else avg = 0;
		imgData.data[i]= avg;
		imgData.data[--i]= avg;
		imgData.data[--i]= avg;
	  
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y); 
}

/*
	Function: sepia
	Apply sepia filter
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - option BufferedDrawable
*/
Filter.sepia = function(x,y,width,height, bufferedImage){
	
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = imgData.data[i];
		g = imgData.data[i-1];
		r = imgData.data[i-2];
		imgData.data[i]=  (r * .272) + (g *.534) + (b * .131);
		imgData.data[--i]= (r * .349) + (g *.686) + (b * .168) ;
		imgData.data[--i]= (r * .393) + (g *.769) + (b * .189);
	  
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y); 
}

/*
	Function: gamma
	Change gamma
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	gamma - gamma value between 0 to 10
*/
Filter.gamma = function(x,y,width,height, gamma, bufferedImage){
	contrast = parseFloat(gamma);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4,  r,g,b;
	do{
		i -= 2;
		b = imgData.data[i];
		g = imgData.data[i-1];
		r = imgData.data[i-2];
		imgData.data[i]=  (255 * (Math.pow(b * Filter._1Over255, gamma)));
		imgData.data[--i]= (255 * (Math.pow(g * Filter._1Over255, gamma)));
		imgData.data[--i]= (255 * (Math.pow(r * Filter._1Over255, gamma)));
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}
Filter._1Over255 = 1 / 255;

/*
	Function: contrast
	Change contrast 
	
	Parameters:
	x - x pos
	y - y pos
	width - width
	height - height
	contrast - value between -127 to 127
	bufferedImage - option BufferedDrawable
*/
Filter.contrast = function(x,y,width,height, contrast, bufferedImage){
	contrast = parseInt(contrast,10);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	var factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
	do{
		i -= 2;
		b = imgData.data[i];
		g = imgData.data[i-1];
		r = imgData.data[i-2];	
		imgData.data[i] = factor * (b - 128) + 128;
		imgData.data[--i] = factor * (g - 128) + 128;
		imgData.data[--i] = factor * (r - 128) + 128;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: brightness
	Change brightness
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	brightness - value between -127 to 127
	bufferedImage - option BufferedDrawable
*/
Filter.brightness = function(x,y,width,height, brightness, bufferedImage){
	brightness = parseInt(brightness,10);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = imgData.data[i] + brightness;
		if (b > 255) b = 255;
		if (b < 0) b = 0;
		g = imgData.data[i-1] + brightness;
		if (g > 255) g = 255;
		if (g < 0) g = 0;
		r = imgData.data[i-2] + brightness;
		if (r > 255) r = 255;
		if (r < 0) r = 0;
		imgData.data[i] = b;
		imgData.data[--i] = g;
		imgData.data[--i] = r;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: invert
	Invert color
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.invert = function(x,y,width,height, bufferedImage){
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = 255 - imgData.data[i];
		g = 255 - imgData.data[i-1];
		r = 255 - imgData.data[i-2];
		imgData.data[i] = b;
		imgData.data[--i] = g;
		imgData.data[--i] = r;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: solarize
	Solarize effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	threshold - value between 0 to 255
	bufferedImage - optional BufferedDrawable
*/
Filter.solarise = function(x,y,width,height, threshold, bufferedImage){
	threshold = parseInt(threshold,10);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, r,g,b;
	do{
		i -= 2;
		b = imgData.data[i];
		if (b < threshold) b = 255 - b;
		g = imgData.data[i-1];
		if (g < threshold) g = 255 - g;
		r = imgData.data[i-2];
		if (r < threshold) r = 255 - r;
		imgData.data[i] = b;
		imgData.data[--i] = g;
		imgData.data[--i] = r;
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: saturation
	Change saturation
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	saturation - value between -1 to 1
	bufferedImage - option BufferedDrawable
*/
Filter.saturation = function(x,y,width,height, saturation, bufferedImage){
	saturation = parseFloat(saturation);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, tmp;
	do{
		i -= 2;
		tmp = rgbToHsl(imgData.data[i - 2],imgData.data[i-1],imgData.data[i]);
		tmp = hslToRgb(tmp[0], tmp[1] + saturation,tmp[2]);
		imgData.data[i] = tmp[2];
		imgData.data[--i] = tmp[1];
		imgData.data[--i] = tmp[0];
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: hue
	Change hue
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	hue - value between -1 to 1
	bufferedImage - optional BufferedDrawable
*/
Filter.hue = function(x,y,width,height, hue, bufferedImage){
	hue = parseFloat(hue);
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var i = width * height * 4, tmp;
	do{
		i -= 2;
		tmp = rgbToHsl(imgData.data[i - 2],imgData.data[i-1],imgData.data[i]);
		tmp = hslToRgb(tmp[0] + hue,tmp[1],tmp[2]);
		imgData.data[i] = tmp[2];
		imgData.data[--i] = tmp[1];
		imgData.data[--i] = tmp[0];
	}while(i);
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
}

/*
	Function: emboss
	Emboss effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.emboss = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[-2,-1,0,-1,1,1,0,1,2],bufferedImage);
}

/*
	Function: blur
	Blur effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.blur = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9, 1/9],bufferedImage);
}

/*
	Function: edge
	Edge effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.edge = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[0,1,0,1,-4,1,0,1,0],bufferedImage);
}

/*
	Function: sharpen
	Sharpen effect
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	bufferedImage - optional BufferedDrawable
*/
Filter.sharpen = function(x,y,width,height,bufferedImage){
	Filter.applyKernel(x,y,width,height,[0,-1,0,-1,5,-1,0,-1,0],bufferedImage);
}


/*
	Function: applyKernel
	Apply a convolution 3x3 kernel 
	
	Parameters:
	x - x
	y - y
	width - width
	height - height
	kernel - a kernel array of 9 values
	bufferedImage - optional BufferedDrawable
*/
Filter.applyKernel = function(x,y,width,height,kernel, bufferedImage){
	if (!kernel || kernel.length != 9) return;
	if (bufferedImage)
		var imgData = bufferedImage.pixels;
	else
		var imgData = Engine.context.getImageData(x, y, width, height);
	var count = width * height * 4;
	var tmp0 = 0;
	var tmp1 = 0;
	var tmp2 = 0;
	var r = 0;
	var c = 0;
	var wm14 = (width - 1) * 4;
	var wp14 = (width + 1) * 4;
	var w4 = width * 4;
	var d = imgData.data;
	
	var clone =[];
	
	for (var i = 0; i < d.length; i++)
		clone[i] = d[i];
	
	for (var i = 0; i < count; i+=4){
		tmp0 = 0;
		tmp1 = 0;
		tmp2 = 0;
		var i1 = i + 1;
		var i2 = i + 2;
		
		if (r > 0){
			if (c > 0){
				tmp0 += clone[i - wp14] * kernel[0];
				tmp1 += clone[i1 - wp14] * kernel[0];
				tmp2 += clone[i2 - wp14] * kernel[0];
			}
			tmp0 += clone[i - w4] * kernel[1];
			tmp1 += clone[i1 - w4] * kernel[1];
			tmp2 += clone[i2 - w4] * kernel[1];
			
			if (c <  width - 1){
				tmp0 += clone[i - wm14] * kernel[2];
				tmp1 += clone[i1 - wm14] * kernel[2];
				tmp2 += clone[i2 - wm14] * kernel[2];
			}
		}
		
		if (c > 0){
			tmp0 += clone[i - 4] * kernel[3];
			tmp1 += clone[i - 3] * kernel[3];
			tmp2 += clone[i - 2] * kernel[3];

		}
		
		tmp0 += clone[i] * kernel[4];
		tmp1 += clone[i1] * kernel[4];
		tmp2 += clone[i2] * kernel[4];
		
		if (c < width - 1){
			tmp0 += clone[i + 4] * kernel[5];
			tmp1 += clone[i + 5] * kernel[5];
			tmp2 += clone[i + 6] * kernel[5];
		}
		
		if (r < height - 1){
			if (c > 0){
				tmp0 += clone[i + wm14] * kernel[6];
				tmp1 += clone[i1 + wm14] * kernel[6];
				tmp2 += clone[i2 + wm14] * kernel[6];
			}
		
			tmp0 += clone[i + w4] * kernel[7];
			tmp1 += clone[i1 + w4] * kernel[7];
			tmp2 += clone[i2 + w4] * kernel[7];
			if (c < width - 1){
				tmp0 += clone[i + wp14] * kernel[8];
				tmp1 += clone[i1 + wp14] * kernel[8];
				tmp2 += clone[i2 + wp14] * kernel[8];
			}
		}
		d[i] = (tmp0 < 0)?0:(tmp0 > 255)?255:floor(tmp0); 		//r
		d[i1] = (tmp1 < 0)?0:(tmp1 > 255)?255:floor(tmp1);	//g
		d[i2] = (tmp2 < 0)?0:(tmp2 > 255)?255:floor(tmp2);	//b
		
		c++;
		if (c >= width){
			c = 0;
			r++;
		}
		
	}
	if (!bufferedImage)
		Engine.context.putImageData(imgData,x,y);
	else
		bufferedImage.update();
}
 
/*
	Function: rgbToHsl
	Converts an RGB color value to HSL.
	
	Assumes r, g, and b are contained in the set [0, 255] and
	
	returns h, s, and l in the set [0, 1].
 
	Parameters:
	r - The red color value
	g - The green color value
	b - The blue color value
  
	Return: Array containing the HSL representation
*/
function rgbToHsl(r, g, b){
    r *= rgbToHsl._255;
	g *= rgbToHsl._255;
	b *= rgbToHsl._255;
	
    var max = r;
	if (g > max) max = g;
	if (b > max) max = b;
	var min = r;
	if (min > g) min = g;
	if (min > b) min = b;
    var h, s, l = (max + min) * 0.5;

    if(max == min){
        h = s = 0; // achromatic
    }else{
        var d = max - min;
        if (l > 0.5)
			s = d / (2 - d);
		else
			s = d / (max + min);
        if (max == r)
            h = (g - b) / d + (g < b ? 6 : 0);
		else if (max == g)
            h = (b - r) / d + 2;
		else 
            h = (r - g) / d + 4;
        h *= 0.1666667;
    }

    return [h, s, l];
}
rgbToHsl._255 = 1/255;


/*
	Function: hslToRgb
	Converts an HSL color value to RGB.
	
	Assumes h, s, and l are contained in the set [0, 1] and
	
	returns r, g, and b in the set [0, 255].
	
	Parameters:
		h - The hue
		s - The saturation
		l - The lightness
	
	Return:  Array of the RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;

    if(s == 0){
        r = g = b = l; // achromatic
    }else{
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hslToRgb.hue2rgb(p, q, h + 0.33333333);
        g = hslToRgb.hue2rgb(p, q, h);
        b = hslToRgb.hue2rgb(p, q, h - 0.33333333);
    }

    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
}

hslToRgb.hue2rgb = function (p, q, t){
	if(t < 0) t += 1;
	if(t > 1) t -= 1;
	if(t < 0.16666667) return p + (q - p) * 6 * t;
	if(t < 0.5) return q;
	if(t < 0.66666667) return p + (q - p) * (0.66666667 - t) * 6;
	return p;
}