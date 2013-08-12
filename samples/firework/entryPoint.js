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
var home = new Area();
var d = new HashMap();
var artificeDone = false;
var p;

function setup(){
	Engine.init(true);
	
	home.init = function(){
		p = new ArrayList();
		
		for (var i = 0; i < 10; i ++){
			p.add(new ParticleSystem(new Vector(0,1), random(10,100), ParticleSystem.SEMI_LINEAR, false, new Vector(Engine.width / 9 * (i+1),Engine.height * 0.7),40, new Vector(random(-0.2,0.2),random(-0.8,0)) , random(1000,4000), getRandomColor(), random(4,6),3));
			home.addDrawable(1,p.get(i));
		}
		
		d.put("planete",new Drawable(0,0,"images/planet.jpg"));
		d.put("vaisseau",new Entity(-100,0,"images/vaisseau.png",0,0,0));
		d.put("vaisseauPropulseur", new ParticleSystem(new Vector(-0.3,0), 30, ParticleSystem.SEMI_LINEAR, true, new Vector(600,400),0, new Vector(-1,0) , 500, new color(255,127,39), 2, 2));
		d.put("artifice", new ParticleSystem(new Vector(0,1), 300, ParticleSystem.EXPLOSION, false, new Vector(600,400),20, new Vector(0,-1) , 10000, ParticleSystem.RANDOM, 4, 4));
		
		
		d.get("vaisseau").setCheckPoint([new CheckPoint(-200,Engine.height * 0.5),new CheckPoint(Engine.width + 300,Engine.height * 0.5)],4000);
		d.get("vaisseauPropulseur").play();
		
		d.get("vaisseau").onCheckPointDone = function() {
			d.get("vaisseau").stopCheckPoint();
			d.get("vaisseauPropulseur").stop();
		};
		
		home.addDrawable(5, d.get("planete"));
		home.addDrawable(4, d.get("vaisseau"));
		home.addDrawable(4, d.get("vaisseauPropulseur"));
		home.addDrawable(3, d.get("artifice"));
		
		home.setFullScreenBackground("images/ciel.png");
		Engine.setAlwaysRefresh(true);
	};	
	
	Engine.setCurrentArea(home);
}

home.beforeRender = function(){
	d.get("vaisseauPropulseur").setPos(d.get("vaisseau").x + 10,d.get("vaisseau").y + 52);;
	if (d.get("vaisseau").x >= Engine.width * 0.5 && !artificeDone){
		artificeDone = true;
		d.get("artifice").setPos(d.get("vaisseau").x, d.get("vaisseau").y + 100);
		d.get("artifice").reset();
		d.get("artifice").play();
	}
};

home.afterRender = function(){
	if (artificeDone && d.get("artifice").stopped()){
		fill(255,255,255);
		text("YESS YESS YESS", Engine.width * 0.5, Engine.height * 0.5);
		for (var i = 0; i < 10; i ++){
			if (p.get(i).stopped()){
				p.get(i).setColor(getRandomColor());
				p.get(i).play();
				break;
			}
		}
	}		
};

