<?php
echo "Hello\n";
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$app->make(Illuminate\Contracts\Console\Kernel::class)->bootstrap();

$controller = new \App\Http\Controllers\Api\MenuController();
$response = $controller->homepageCategories();
$data = json_encode($response->getData(), JSON_PRETTY_PRINT);
file_put_contents('output_api.json', $data);
echo "Output saved to output_api.json\n";
