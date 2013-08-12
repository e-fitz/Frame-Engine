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

	Load ressources for database by ajax call and instanciate data
	Take care of asynchronous loading
*/
function DataLoader(){
	this.instanceName = "DataLoader";
}

DataLoader.prototype = {
	/* Load asynchronously image into ressources hashmap  */
	loadImageDB : function(imageId){
		if (library.containsKey(imageId)) return;
		
		library.put(imageId, null);	/* Prevents multiloading */
		
		if (DEBUG_MODE){
			console.info("Loading image : " + imageId + " from database");
		}
		getRessource_ajax(imageId, DataLoader.callback);
	},
	
	/*
		Load a drawable
	*/
	loadRessourceDB : function(imageId){
		DataLoader.loadImageDB(imageId);
	},
	
	/*
		A callback for loadImageDB
	*/
	callback : function(data, imageId){
		if (DEBUG_MODE){
			console.info("Processing ressources obtained from the database " + data);
			if (data == null || data == "" || data == 0 || data == undefined){
				console.error("Unaivalable to retreive image " + imageId);
			}
		}
		library.put(imageId, loadImage(data));
		if (DEBUG_MODE){
			console.info("Ressource " + imageId + " well loaded");
		}
	},
	
	/*
		Load an area from the database
	*/
	loadAreaDB: function(id, callback){
		getArea_ajax(id, callback);
	}
}
DataLoader.prototype.constructor = DataLoader;
