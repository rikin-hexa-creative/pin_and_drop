<?php

namespace App\Filament\Admin\Resources\Categories\Pages;

use App\Filament\Admin\Resources\Categories\CategoryResource;
use Filament\Resources\Pages\EditRecord;

class EditCategory extends EditRecord
{
    protected static string $resource = CategoryResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $adminId = auth()->guard('admin')->id();
        $data['is_active'] = (bool) ($data['is_active'] ?? false);
        $data['is_approved'] = (bool) ($data['is_approved'] ?? false);

        if ($data['is_approved']) {
            $data['approved_by'] = $this->record->approved_by ?? $adminId;
            $data['approved_at'] = $this->record->approved_at ?? now();
        } else {
            $data['approved_by'] = null;
            $data['approved_at'] = null;
        }

        return $data;
    }
}
