<?php

namespace App\Filament\Vendor\Resources\Categories\Pages;

use App\Filament\Vendor\Resources\Categories\CategoryResource;
use Filament\Resources\Pages\CreateRecord;
use Illuminate\Support\Str;

class CreateCategory extends CreateRecord
{
    protected static string $resource = CategoryResource::class;

    protected function mutateFormDataBeforeCreate(array $data): array
    {
        $data['created_by_vendor'] = auth()->guard('vendor')->id();
        $data['is_active'] = false;
        $data['is_approved'] = false;

        if (blank($data['slug'] ?? null) && filled($data['name'] ?? null)) {
            $data['slug'] = Str::slug($data['name']);
        }

        return $data;
    }
}
