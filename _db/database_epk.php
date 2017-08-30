<?php
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$_dbconnect = parse_ini_file('config.ini.php');

$conn = mysql_connect($_dbconnect['host'], $_dbconnect['user'], $_dbconnect['password']);
mysql_select_db($_dbconnect['intranet']);
$charset = $_dbconnect['charset'];
mysql_query("SET NAMES '$charset'");
?>

