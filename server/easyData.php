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

	Display methods to esaily save and load data from the database,
**/

require('helpers/DataBaseHelper.php');
require('helpers/AjaxHelper.php');

if (empty($_REQUEST['key']))
	sendResponse(false);

/**
	Return a ressource from the database
**/
function load(){
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT value FROM easyStorage WHERE `key` = :key', array('key'=>$_REQUEST['key']));
	
	if ($db === false || !isset($db[0]) || !isset($db[0][0]))
		sendResponse(true,  array('result' => false, 'key' => $_REQUEST['key']));
	else
		sendResponse(true, array('result' => $db[0][0], 'key'=> $_REQUEST['key']));
}

/**	
	Easy login system
**/
function login(){

}

/**
	Return an area from the database	
**/
function save(){
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT value FROM easyStorage WHERE `key` =  :key', array('key'=>$_REQUEST['key']));
	if (empty($db[0])){		
		$db = DataBaseHelper::getInstance();
		$res = $db->exec('INSERT INTO easyStorage(`key`,`value`) VALUES (:key,:value);', array(':key'=>$_REQUEST['key'],':value'=>$_REQUEST['value']));
		if ($res === false){
			$er = $db->getLastError();
			sendResponse(true,$er[2]);
		}
		
	}else{
		$db = DataBaseHelper::getInstance();
		$res = $db->exec('UPDATE easyStorage SET `value` = :value WHERE `key` = :key', array(':key'=>$_REQUEST['key'],':value'=>$_REQUEST['value']));
		if ($res === false){
			$er = $db->getLastError();
			sendResponse(true,$er[2]);
		}
	}
	sendResponse(true, true);
}

autoDispatch();