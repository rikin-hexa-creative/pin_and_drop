<?php

namespace App\Filament\Admin\Resources\Vendors\Pages;

use App\Filament\Admin\Resources\Vendors\VendorResource;
use Filament\Resources\Pages\EditRecord;

class EditVendor extends EditRecord
{
    protected static string $resource = VendorResource::class;

    protected function mutateFormDataBeforeSave(array $data): array
    {
        $status = $data['status'] ?? null;
        $adminId = auth()->guard('admin')->id();

        if ($status === 'approved') {
            $data['approved_by'] = $this->record->approved_by ?? $adminId;
            $data['approved_at'] = $this->record->approved_at ?? now();
        } else {
            $data['approved_by'] = null;
            $data['approved_at'] = null;
        }

        return $data;
    }
}
