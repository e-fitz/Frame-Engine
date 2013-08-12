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

	Get data need to load a ressource from the database
*/
function sendMessage_ajax(topic,uniqueId, key, value){

	frameHelper().getJSON(
		Engine.server_url +  "network.php",
		{'method' : 'addMessage','topic' : topic, 'key':key, 'value':value, 'uniqueId':uniqueId}
	);
}

/*
	Get data need to load an area from the database
*/
function getMessages_ajax(topic,uniqueId, key, timestamp, preprocess, that, callback){
	frameHelper().getJSON(
		Engine.server_url + "network.php",
		{'method' : 'getMessages','topic' : topic, 'key':key,'uniqueId':uniqueId, 'timestamp':timestamp},
		function(data){
			preprocess.call(that,key, data, callback); 
		}
	);
}

/*
	Return an uniqueId for this user
*/
function getUniqueId_ajax(that, topic,callback){
	frameHelper().getJSON(
		Engine.server_url + "network.php",
		{'method' : 'getUniqueId','topic' : topic},
		function(data){
			callback.call(that,data);
		}
	);
}

/*
	Enter room process
*/
function enterRoom_ajax(that, topic, callback){
	frameHelper().getJSON(
		Engine.server_url + "network.php",
		{'method' : 'enterRoom','topic' : topic},
		function(data){
			callback(that,data);
		}
	);
}

/*
	Leave room process
*/
function leaveRoom_ajax(topic, uniqueId, roomInstance){
	frameHelper().getJSON(
		server_url + "network.php",
		{'method' : 'leaveRoom','topic' : topic, 'uniqueId':uniqueId,'roomInstance':roomInstance}
	);
}

function easyDataLoad_ajax(that,key, callback){
	frameHelper().getJSON(
		server_url + "easyData.php",
		{'method' : 'load','key' : key},
		function(data){
			callback.call(that,data);
		}
	);
}

function easyDataSave_ajax(that, key, value, callback){
	frameHelper().getJSON(
		server_url + "easyData.php",
		{'method' : 'save','key' : key, 'value':value},
		function(data){
			callback.call(that,data);
		}
	);
}
