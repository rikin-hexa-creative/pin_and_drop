<?php

use Illuminate\Support\Facades\Storage;

test('public disk urls are same-origin by default', function () {
    expect(config('filesystems.disks.public.url'))->toBeNull();
    expect(Storage::disk('public')->url('products/example.png'))->toBe('/storage/products/example.png');
});
