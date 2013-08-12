<?php
/**

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

	Load data from the database with JSONP request/response
**/

require('helpers/DataBaseHelper.php');
require('helpers/AjaxHelper.php');

if (empty($_REQUEST['id']) || !is_numeric($_REQUEST['id']))
	sendResponse(false);

/**
	Return a ressource from the database
**/
function ressource(){
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT url FROM ressources WHERE id = ' . $_REQUEST['id']);
	sendResponse(true, $db[0][0]);
}

/**
	Return an area from the database	
**/
function area( ){
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT id, width, height, matrix, events FROM areas WHERE id = ' . $_REQUEST['id']);
	sendResponse(true, $db[0]);
}

autoDispatch();