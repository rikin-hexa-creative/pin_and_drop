<?php

namespace App\Filament\Vendor\Resources\Products\Pages;

use App\Filament\Vendor\Resources\Products\ProductResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateProduct extends CreateRecord
{
    protected static string $resource = ProductResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['vendor_id'] = auth()->guard('vendor')->id();

        if (blank($data['slug'] ?? null) && filled($data['name'] ?? null)) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $data;
    }
}
