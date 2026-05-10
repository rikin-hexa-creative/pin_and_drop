<?php

namespace App\Filament\Admin\Resources\UserSales\Pages;

use App\Filament\Admin\Resources\UserSales\UserSaleResource;
use Filament\Actions\DeleteAction;
use Filament\Resources\Pages\EditRecord;

class EditUserSale extends EditRecord
{
    protected static string $resource = UserSaleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            DeleteAction::make(),
        ];
    }
}
