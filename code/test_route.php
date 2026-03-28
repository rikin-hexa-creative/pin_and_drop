<?php
$request = Illuminate\Http\Request::create('/api/menus/vendors', 'GET');
$response = app()->handle($request);
echo $response->getContent();

$request2 = Illuminate\Http\Request::create('/api/menus/categories', 'GET');
$response2 = app()->handle($request2);
file_put_contents('test_output.json', $response2->getContent());
