<?php

namespace App\Filament\Vendor\Resources\Products\Pages;

use App\Filament\Vendor\Resources\Products\ProductResource;
use Filament\Resources\Pages\EditRecord;

class EditProduct extends EditRecord
{
    protected static string $resource = ProductResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $data['vendor_id'] = auth()->guard('vendor')->id();

        return $data;
    }
}
