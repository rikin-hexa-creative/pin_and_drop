<?php
$categories = \App\Models\Category::rootOnly()->with('children.children')->get();
$vendors = \App\Models\Vendor::approved()->limit(32)->get();
file_put_contents('output_utf8.json', json_encode(['categories' => $categories, 'vendors' => $vendors], JSON_PRETTY_PRINT));
