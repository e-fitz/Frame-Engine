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
window.translations = new HashMap();

/*
	Function: setLanguage
	*global*
	
	Set current displaying language
	
	Parameters:
	languageCode - 'FR', 'EN', 'ES', 'IT'...
*/
function setLanguage(languageCode){
	storage.setItem('language', languageCode.toUpperCase());
}

/*
	Function: addText
	*global*
	
	ASCII String without space
	
	Parameters:
	languageCode - 'FR', 'EN', 'ES', 'IT'...
	key - key
	val - val
*/
function addText(languageCode, key, value){
	key = key.replace(/ /g,'_');
	translations.put(key.toUpperCase() + languageCode.toUpperCase(), value);
}

/*
	Function: __text
	*global*
	
	Return text translation for a specified key
	
	Parameters:
	key - key
*/
function __text(key){
	return translations.get(key.toUpperCase() + storage.getItem('language'));
}