<?php
/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
$_dbconnect = parse_ini_file('config.ini.php');
$hostname = $_dbconnect['as'];

$db = odbc_connect($server, $username, $password);
try {
    $dbh = new PDO("odbc:".$hostname);
    
//    if($dbh)
//        echo "Connected!<br/><br/>";
//    
//    $query = "select * from UMOWA.KT";
//    $code_object = "JA3+";
//    $query = "select distinct umtum,umrum,umnum from umowa.kt, umowa.iw, umowa.um where ktsym = iwsym and umtum=kttkt and umrum=ktrkt and umnum=ktnkt and iwkod like '$code_object' order by umrum, umnum asc";
//    $stm = $dbh->query($query);
//    while ($row = $stm->fetch())
//    {
//        print_r($row);
//    }
    
} catch (PDOException $exception) {
  echo $exception->getMessage();
  exit;
}

?>
