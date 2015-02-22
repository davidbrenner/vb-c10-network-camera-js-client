<?php
// PHP Proxy example for Yahoo! Web services. 
// Responds to both HTTP GET and POST requests
//
// Author: Jason Levitt
// December 7th, 2005
//

//ini_set('display_errors', 'On');
//error_reporting(E_ALL);

// HOSTNAME should be in the format http://your-webcam-url.com/-wvhttp-01-/
define ('HOSTNAME', 'http://lakeminnetonkawebcam.mooo.com/-wvhttp-01-/');

// Get the REST call path from the AJAX application
// Is it a POST or a GET?
$path = ($_POST["path"]) ? $_POST["path"] : $_GET["path"];
$url = HOSTNAME.$path;

// Open the Curl session
$session = curl_init($url);

// If it's a POST, put the POST data in the body
if ($_POST['path']) {
	$postvars = '';
	while ($element = current($_POST)) {
		$postvars .= urlencode(key($_POST)).'='.urlencode($element).'&';
		next($_POST);
	}
	curl_setopt ($session, CURLOPT_POST, true);
	curl_setopt ($session, CURLOPT_POSTFIELDS, $postvars);
}

// Don't return HTTP headers. Do return the contents of the call
curl_setopt($session, CURLOPT_HEADER, false);
curl_setopt($session, CURLOPT_RETURNTRANSFER, true);

// Make the call
$xml = curl_exec($session);

// The web service returns XML. Set the Content-Type appropriately
//header("Content-Type: text/xml");

echo $xml;
curl_close($session);

?>
