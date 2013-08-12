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

	DataBase Helper, singleton
**/
class DataBaseHelper{

	private static $db_host = '127.0.0.1';
	private static $db_port = '3306';
	private static $db_name = 'mecha';
	private static $db_user = 'simon';
	private static $db_password = 'smonh';
	protected $_last_error;
	protected $_last_id;

	private static $_instance = null;
	
	private function __construct() {}
	
	/**
		Return instance to use
	**/
	public static function getInstance(){
		if (is_null(self::$_instance))
			self::$_instance = new DataBaseHelper();
		return self::$_instance;
	}
	
	/**
		Connect the instance to the database
	**/
	private function connect(){
		try{
			return new PDO('mysql:host=' . self::$db_host . ';port=' . self::$db_port . ';dbname=' . self::$db_name , self::$db_user, self::$db_password);
		}catch(Exception $e){
			
			if (DEBUG == 'true')
				die($e->getMessage());
			else
				die('An error occured.');
		}
		return false;
	}

	/**
		Execute an sql query (only for modification)
	**/
	public function exec($statement, $values){
		$pdo = $this->connect();
		$tmp = $pdo->prepare($statement);
		$result = $tmp->execute($values);
		$this->_last_id = $pdo->lastInsertId();
		$this->_last_error = $tmp->errorInfo();
		return $result;
	}

	/**
		Execute an sql query (only for reading)
	**/
	public function query($statement, $values = null){
		$pdo = $this->connect();
		$pdo = $pdo->prepare($statement);
		if ($values != null)
			$pdo->execute($values);
		else 
			$pdo->execute();
		$this->_last_error = $pdo->errorInfo();
		return $pdo->fetchAll();
	}

	/**
		Return last error information
	**/
	public function getLastError(){
		return $this->_last_error;
	}

	/**
		Return last inserted id
	**/
	public function lastInsertedId(){
		return $this->_last_id;
	}
}
?>
