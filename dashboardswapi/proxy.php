<?php
if (!isset($_GET['endpoint'])) {
  http_response_code(400);
  echo json_encode(["error" => "Falta parámetro endpoint"]);
  exit;
}

$endpoint = $_GET['endpoint'];
$apiUrl = "https://swapi.dev/api/" . $endpoint;

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $apiUrl);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
$response = curl_exec($ch);
curl_close($ch);

header('Content-Type: application/json');
echo $response;
