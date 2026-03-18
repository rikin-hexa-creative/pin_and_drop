<?php

namespace App\Filament\Vendor\Resources\Categories\Pages;

use App\Filament\Vendor\Resources\Categories\CategoryResource;
use Filament\Resources\Pages\EditRecord;

class EditCategory extends EditRecord
{
    protected static string $resource = CategoryResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['created_by_vendor'] = auth()->guard('vendor')->id();

        return $data;
    }
}
