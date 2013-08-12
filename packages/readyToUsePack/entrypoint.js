var area = new Area();
function setup(){
	Engine.init(true);
	Engine.setCurrentArea(area);
	Engine.setAlwaysRefresh(true);
}

area.init = function(){
	var d = new Drawable(Engine.width * 0.5 - 100,Engine.height * 0.5 - 100,"images/bubble.png");
	BaseElement.rotateTo(d,360,5000,function(){ BaseElement.scaleTo(this, 3,3, 0.05,0.05, true,function(){ BaseElement.scaleTo(this, 1,1, 0.05,0.05, true); }); });
	this.addDrawable(0,d);
};
	