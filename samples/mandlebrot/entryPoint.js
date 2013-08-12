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
var area = new Area();
var buffer = new BufferedDrawable(0,0,"images/start.png");
var couleur = [];
var zoom = 180;
var iterations_max = 50;
var updated = false;
var t_zoom= new TextElement(20, 40, "zoom : 100", color(255,255,255));

function setup(){
	Engine.init(false, 500, 500);
	Engine.setCurrentArea(area);
}


area.init = function(){
	for(var i = 0; i < iterations_max; i++){
		couleur[i] = floor(i*255/iterations_max);
	}
	this.addDrawable(0,buffer);
	this.addDrawable(0, new TextElement(20,20,"Left click to zoom in, space key to zoom out", color(255,255,255)));
	this.addDrawable(0, t_zoom);
}


area.beforeRender = function(){
	if (updated && Engine.buttonPressed === 0){
		zoom += 1;
		updated = false;
		t_zoom.setText("zoom : " + zoom);
	}else if (updated && Input.keysDown[KEY_SPACE]){
		zoom -= 1;
		updated = false;
		t_zoom.setText("zoom : " + zoom);
	}
	if (!updated){
		var x1 = -2.1;
		var x2 = 0.7;
		var y1 = -1.3;
		var y2 = 1.2;
		
		var image_x = floor((x2 - x1)*zoom);
		if (image_x > buffer.width) image_x = buffer.width;
		var image_y = floor((y2 - y1)*zoom);
		if (image_y > buffer.height) image_y = buffer.height;
		var pixels = buffer.getPixels();
		var image_x4 = 500 * 4;
		
		for(var x = 0; x < image_x; x++){
			var c_r = x/zoom+x1;
			var tmpx =  x * image_x4;
			for(var y = 0;  y < image_y; y++){
				var pos = tmpx + y * 4;
				if (pos + 4 < pixels.length){
					var c_i = y/zoom+y1;
					var z_r = 0;
					var z_i = 0;
					var i   = 0;
					do{
						var tmp = z_r;
						z_r = z_r*z_r - z_i*z_i + c_r;
						z_i = 2*tmp*z_i + c_i;
						i++;
					} while(z_r*z_r + z_i*z_i < 4 && i < iterations_max);
				
					if(i == iterations_max){
							pixels[pos] = 0;
							pixels[pos + 1] = 0;
							pixels[pos + 2] = 0;
							pixels[pos + 3] = 255;
					}else{
						pixels[pos] = 0;
						pixels[pos + 1] = 0;
						pixels[pos + 2] = couleur[i];
						pixels[pos + 3] = 255;
					}
				}
			}
		}
		buffer.setPixels(pixels);
		buffer.update();
		updated = true;
	}
}
	