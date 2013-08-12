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

	Class: Network
	Permit to exchange information between players in a topic, all player in the topic receive the messages
*/
var Network = Base.extend({

	/*
		Constructor: Network
		
		Parameters:
		topicName - name to the topic where data are transmisted
	*/
	constructor : function(topicName){
		this.instanceName = "Network";
		this.uniqueId = -1;
		this.topic = topicName;
		this.timer = new Timer(1000);
		this.lastCall = new HashMap();
		getUniqueId_ajax(this,this.topic, this.setUniqueId);
	},
		
	setUniqueId : function(id){
		this.uniqueId = id[0];
	},
	
	/*
		Function: getUniqueId
		Return the unique id of the player
	*/
	getUniqueId : function(){
		return this.uniqueId;
	},
	
	/*
		Function: setTimer
		Set the elapsed time before new message are take in
		
		Parameters:
		interval - millisecond
	*/
	setTimer : function(interval){
		this.timer = new Timer(interval);
	},
	
	/*
		Function: sendMessage
		Send information to other player connected to the topic
		
		Parameters:
		key -  key in the topic
		value - value
	*/
	sendMessage : function(key, value){
		sendMessage_ajax(this.topic, this.uniqueId,key,value);
	},
	
	/*
		Function: getMessages
		Get waiting information for the caller relative to the key 
		
		Parameters:
		key - key in the topic
		callback - callback function
	*/
	getMessages : function(key, callback){
		if (this.timer.itsTime()){
			var s = this.lastCall.get(key);
			if (s == null) s = '2012-01-01 00:00:00';
			getMessages_ajax(this.topic,this.uniqueId,key, s , this.preprocess,this, callback);
		}
	},
	
	/*
		Function: forceGetMessages
		Get message without waiting timer
		
		Parameters:
		key - key in the topic
		callback - callback function
	*/
	forceGetMessages : function(key, callback){
		var s = this.lastCall.get(key);
		if (s == null) s = '2012-01-01 00:00:00';
		getMessages_ajax(this.topic,this.uniqueId,key, s , this.preprocess,this, callback);
	},
	
	preprocess : function(key,data, callback){
		this.lastCall.put(key, data[0].timestamp);
		callback(data[0]);
	},
	
	/*
		Function: itsTime
		Return true if it's time to get message
	*/
	itsTime : function(){
		return this.timer.itsTime();
	},
	
	/*
		Function: changeTopic
		Change current topic
		
		Parameters:
		topicName - new topic name
	*/
	changeTopic : function(topicName){
		this.topic = topicName;
	}
	
});


/*
	Class: Room
	Organized informations exchanged, with a max player value,
	only player on the room receive the messages
*/

var Room = Base.extend({
	state : 0,
	
	/*
		Constructor: Room
		Parameters:
		roomName - unique room name for your game
		interval - how fast data had to be retrieved
	*/
	constructor : function(roomName, interval){
		if (DEBUG_MODE){
			if (arguments.length != 2) console.error("Room not instanciated waiting 2 arguments " + arguments.length + " given.");
		}
		this.roomName = roomName;
		this.interval = interval;
		this.network = new Network(roomName);
		this.network.setTimer(interval);
		this.handlers = [];
	},
	
	/*
		Process get mesage on the current room (call by Engine)
	*/
	process : function(){
		if (this.isReady()){
			if (!this.network.itsTime()) return;
			for (var i = this.handlers.length - 1; i >= 0; i--)
				this.network.forceGetMessages(this.handlers[i][0],this.handlers[i][1]);
		}
	},
	
	/*
		Process player entering room (autocalled by constructor)
	*/
	enterRoom_async : function(that, roomInstance){
		that.roomInstance = roomInstance;
		that.network.changeTopic(that.roomName + roomInstance);
		frameHelper(window).beforeunload(function(){ that.leaveRoom(); return EXIT_MESSAGE;});
		that.state = 2;
	},
	
	/*
		Function: isReady
		Return true if the room is ready
	*/
	isReady : function(){
		if (this.state == 2) return true;
		if (this.network.getUniqueId() >= 0 && this.state == 0){
			this.state = 1;
			enterRoom_ajax(this, this.roomName, this.enterRoom_async);
		}
		return false;
	},
	
	
	/*
		Function: sendMessage
		Send a message in the room instance occupied by the caller
		
		Parameters:
		key - key in the topic
		value - value to send
	*/
	sendMessage : function(key, value){
		if (this.isReady()){
			this.network.sendMessage(key,value);	
		}
	},
	
	/*
		Function: setMessagesHandler
		Add a function which will be called when a message is received
		
		Parameters:
		key - key in the topic
		callback - callback
	*/
	setMessagesHandler : function(key, callback){
		this.handlers.push([key, callback]);
	},
	
	/*
		Function: getUniqueId
		Return the unique id of the player
	*/
	getUniqueId : function(){
		return this.network.getUniqueId();
	},
	
	/*	
		Function: leaveRoom
		Leave the room
	*/
	leaveRoom : function(){
		leaveRoom_ajax(this.roomName,this.network.getUniqueId(), this.roomInstance);
	}
	
});