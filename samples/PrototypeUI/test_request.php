<?php 
	require('helpers/DataBaseHelper.php');
	require('helpers/AjaxHelper.php');
	$val1 = $_GET['val1'];
	$val2 = $_GET['val2'];
	$resultat = $val1 + $val2;
	sendResponse(true,json_encode($resultat));
?>