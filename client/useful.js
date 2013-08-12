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


	Class: Timer
	Define a timer, interval set a 100ms by default
*/
var Timer = Base.extend({
	
	/*
	Constructor: Timer
	Parameters:
	interval - milliseconds 
	*/
	constructor : function(interval){
		this.interval = interval;
		this.lastTime = millis();
	},

	/*
	*	
		Function: itsTime
		Return true only if the minimum interval is elapsed
	*/
	itsTime : function(){
		if (millis() - this.lastTime > this.interval){
			this.lastTime = millis();
			return true;
		}
		return false;
	},
	
	/*
		Function: changeInterval
		Parameters:
		interval - interval
	*/
	changeInterval : function(interval){
		this.interval = interval;
	}
});

/*
	Class: TimeAlarm
	Act as a reverse chronometer
*/
var TimeAlarm = Base.extend({

	/*
		Constructor: TimeAlarm
		Parameters:
		remainingTime - time remaining 
		started - start at instanciation or not, boolean
	*/
	constructor : function(remainingTime, started){
		this.lastTime = -1;
		this.remainingTime = remainingTime;
		this.initialRemaining  = remainingTime;
		if (started){
			lastTime = millis();
		}
		this.setRemainingTime = function(remainingTime)
		{
			this.remainingTime = remainingTime;
			lastTime = -1;
		}
	},
	
	/*
		Function: getRemainingTime
		Return remaining time
	*/
	getRemainingTime : function(){
		if (this.lastTime == -1){
			this.lastTime =  millis();
		}else{
			this.remainingTime = this.remainingTime - ( millis() - this.lastTime);
			this.lastTime =  millis();
			if (this.remainingTime < 0) this.remainingTime = 0;
		}
		return this.remainingTime;
	},
	
	/*
		Function: itsTime
		Return true if timer end
	*/
	itsTime : function(){
		return (this.getRemainingTime() <= 0);
	},
	
	/*
		Function: reset
		Restart time alarm
	*/
	reset : function(){
		this.remainingTime = this.initialRemaining;
		this.lastTime = -1;
	}
	
});

/*
	Class: CheckPoint
	Define a check point, it's like a point but with atCheckPoint method
*/
var CheckPoint = Base.extend({
	constructor : function(x,y){
		this.x = x;
		this.y = y;
	},

	/*
		return true only if x2 and y2 are equal to the position of this instance
	*/
	atCheckPoint : function(x2,y2){
		return (this.x == x2 && this.y == y2);
	}
	
});

/*
	Function: randomCheckPoint
	Generate an array of "number" checkpoint between min and max
*/
CheckPoint.randomCheckPoint = function(xMin, yMin, xMax, yMax, number){
	var ck = [];

	for (var i =0; i < number; i++){
		xk[i] = new CheckPoint(
			floor(random(0,xMax-xMin)+xMin),
			floor(random(0,yMax-yMin)+yMin)
		);
	}
	return ck;
}