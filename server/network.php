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


	Display methods to :
		- easily save and load data from the database
		- process room management

	You have to set your max number of player here
	
**/

require('helpers/DataBaseHelper.php');
require('helpers/AjaxHelper.php');

define('MAX_PLAYER', 10);

if (empty($_REQUEST['topic']))
	sendResponse(false);

if (isset($_REQUEST['uniqueId']))
	checkSecurity();

/**
	Security check
**/
function checkSecurity(){
	/* Does an user try to change his uniqueId */
	$ip = getValue('users', 'ip', $_REQUEST['uniqueId']);
	if ($ip != $_SERVER['REMOTE_ADDR']){
		sendResponse(false);
	}
}

/**
	Clean data related to the topic
*/
function cleanup(){
	$db = DataBaseHelper::getInstance();
	$db->exec('DELETE FROM topics WHERE `topic` = :topic ;', array(':topic'=>$_REQUEST['topic'] . $_REQUEST['roomInstance']));
	$db->exec('DELETE FROM rooms WHERE `id` = ' . $_REQUEST['roomInstance'], array());
}
	
/**
	Return waiting message in the topic (except message sent by the caller)
	@param key, topic, uniqueId
**/
function getMessages(){
	$r = new stdClass();
	$r->timestamp = date('Y-m-d H:i:s');
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT t.value, t.id FROM topics t WHERE t.key = :key AND t.topic = :topic AND t.uniqueId != :uniqueId AND t.id NOT IN (SELECT topic_id FROM topics_read WHERE uniqueId != :uniqueId)', array(':key'=> $_REQUEST['key'], ':topic'=>$_REQUEST['topic'], ':uniqueId'=>$_REQUEST['uniqueId']));
	$r->results = $db;
	$db = DataBaseHelper::getInstance();
	foreach ($r->results as &$res){
		$db->exec('INSERT INTO topics_read(topic_id, unique_id) VALUES('.$res['id'].','.$_REQUEST['uniqueId'].')',array());
		unset($res['id']);
	}
	sendResponse(true,$r);
}

/**
	Return all waiting message in the topic
	@param key, topic, uniqueId
**/
function getContextMessages(){
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT value FROM topics WHERE `key` = :key AND `topic` = :topic ', array(':key'=> $_REQUEST['key'], ':topic'=>$_REQUEST['topic']));
	if (isset($db[0]))
		sendResponse(true, $db);
	else 
		sendResponse(true,'');
}

/**
	Return an uniqueId, if the user have been connected in the 5 last minutes we return the old uniqueId
	@param topic
**/
function getUniqueId(){
	/* Commment the following 8 lines to debug with only one computer and multiple browser */
	
	$db = DataBaseHelper::getInstance();
	$tmp = $db->query('SELECT uniqueId FROM topics WHERE `key` = :key AND `topic` = :topic AND `value` = :value' , array(':key'=> 'ip', ':topic'=>'users', ':value'=>$_SERVER['REMOTE_ADDR']));
	
	if (isset($tmp[0])){
		$db = DataBaseHelper::getInstance();
		$db = $db->query('SELECT uniqueId FROM topics WHERE \''.date('Y-m-d H:i:s').'\' <= timestamp + INTERVAL 5 MINUTE AND uniqueId = ' . $tmp[0]['uniqueId']  , array(':key'=> 'ip', ':topic'=>'users'));
		if (isset($db[0]))
			sendResponse(true,$db[0]['uniqueId']);
	}
	
	$tmp = getValue($_REQUEST['topic'],'uniqueId','0');
	if (isset($tmp)){
		$uid = $tmp + 1;
		$db = DataBaseHelper::getInstance();
		$db->exec('UPDATE topics SET `value` = :value, timestamp = \'' . date('Y-m-d H:i:s') . '\' WHERE `topic` = :topic AND `key` = :key; AND uniqueId = :uniqueId',array(':topic' =>$_REQUEST['topic'], ':key'=>'uniqueId', ':value'=>$uid, ':uniqueId'=>'0'));
	}else{
		$uid = 0;
		$db = DataBaseHelper::getInstance();
		$db->exec('INSERT INTO topics(`topic`,`key`,`value`, `timestamp`) VALUES(:topic,:key,'.$uid.',\''.date('Y-m-d H:i:s').'\');', array(':topic'=>$_REQUEST['topic'],':key'=>'uniqueId'));
	}
	
	/* Attach ip address to uniqueId for security reason */
	$_REQUEST['topic'] = 'users';
	$_REQUEST['key'] = 'ip';
	$_REQUEST['value'] = $_SERVER['REMOTE_ADDR'];
	$_REQUEST['uniqueId'] = $uid;
	addMessage();
	
	sendResponse(true,$uid);
}

/**
	@param key, topic, uniqueId
**/
function getValue($topic,$key,$uniqueId){
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT value FROM topics WHERE `key` = :key AND `topic` = :topic AND `uniqueId` = ' . $uniqueId , array(':key'=> $key, ':topic'=>$topic));
	if (isset($db[0]))
		return $db[0][0];
	else return null;
}

function setValue($topic,$key,$value, $uniqueId){
	$db = DataBaseHelper::getInstance();
	if (!$db->exec('UPDATE topics SET `value` = :value, `timestamp` = \''.date('Y-m-d H:i:s').'\' WHERE `key` = :key AND `topic` = :topic AND `uniqueId` = ' . $uniqueId, array(':value'=>$value, ':key'=>$key, ':topic'=>$topic))){
		$db = DataBaseHelper::getInstance();
		$db->exec('INSERT INTO topics(`topic`,`key`,`value`,`uniqueId`, `timestamp`) VALUES(:topic,:key,:value,:uniqueId, \''.date('Y-m-d H:i:s').'\');',array(':topic'=>$topic,':key'=>$key, ':value'=>$value,':uniqueId'=>$uniqueId));
	}
}


/**
	Add a message to the system
	@param key, value, topic, uniqueId
**/
function addMessage(){
	$db = DataBaseHelper::getInstance();
	$db->exec('INSERT INTO topics(`topic`,`key`,`value`,`uniqueId`, `timestamp`) VALUES(:topic,:key,:value,:uniqueId, \''.date('Y-m-d H:i:s').'\');',array(':topic'=>$_REQUEST['topic'],':key'=>$_REQUEST['key'], ':value'=>$_REQUEST['value'],':uniqueId'=>$_REQUEST['uniqueId']));
}

/**
	Return the instance of the room associated to the caller
	@param topic
**/
function enterRoom(){
	/* Cleaning database */	
	$db = DataBaseHelper::getInstance();
	$db->exec('DELETE FROM topics WHERE timestamp + INTERVAL 5 MINUTE < \''.date('Y-m-d H:i:s').'\'  AND `key` != \'uniqueId\'', array());
	
	/* Entering room */
	$db = DataBaseHelper::getInstance();
	$db = $db->query('SELECT id, remainingPlaces FROM rooms WHERE `topic` = :topic AND remainingPlaces > 0 LIMIT 0,1;', array(':topic'=>$_REQUEST['topic']));
	if (isset($db[0]['remainingPlaces']) && $db[0]['remainingPlaces'] > 0){
		$tmp = $db;
		$db = DataBaseHelper::getInstance();
		$db->exec('UPDATE rooms SET remainingPlaces = ' . ($tmp[0]['remainingPlaces'] - 1) . ', `timestamp` = \''.date('Y-m-d H:i:s').'\' WHERE `id` = ' . $tmp[0]['id'] . ';', array());
		sendResponse(true, $tmp[0]['id']);
	}else{
		$db = DataBaseHelper::getInstance();
		$db->exec('INSERT INTO rooms(`remainingPlaces`, `topic`,`timestamp` ) VALUES(' . (MAX_PLAYER - 1) . ', :topic, \''.date('Y-m-d H:i:s').'\');', array(':topic' => $_REQUEST['topic']));
		sendResponse(true, $db->lastInsertedId());
	}
}

/**
	Call this method to cleanup database after a user leave a room
	@param roomInstance, topic, uniqueId
**/
function leaveRoom(){
	$db = DataBaseHelper::getInstance();
	$places = $db->query('SELECT remainingPlaces FROM rooms WHERE id = ' . $_REQUEST['roomInstance']);
	$places = $places[0][0] + 1;
	if ($places  >= MAX_PLAYER){
		$db->exec('DELETE FROM topics WHERE `topic` = :topic ;', array(':topic'=>$_REQUEST['topic'] . $_REQUEST['roomInstance']));
		$db->exec('DELETE FROM rooms WHERE `id` = ' . $_REQUEST['roomInstance'], array());
	}else{
		$db = DataBaseHelper::getInstance();
		$db->exec('UPDATE rooms SET remainingPlaces = ' . ($places) . ' WHERE `id` = ' . $_REQUEST['roomInstance'], array());
		$db->exec('DELETE FROM topics WHERE `topic` = :topic AND `uniqueId` = ' . $_REQUEST['uniqueId'], array(':topic'=>$_REQUEST['topic'] . $_REQUEST['roomInstance']));
	}
	
	sendResponse(true);
}

autoDispatch();