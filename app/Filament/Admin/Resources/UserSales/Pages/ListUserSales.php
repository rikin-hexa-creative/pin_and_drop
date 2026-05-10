<?php

namespace App\Filament\Admin\Resources\UserSales\Pages;

use App\Filament\Admin\Resources\UserSales\UserSaleResource;
use Filament\Actions\CreateAction;
use Filament\Resources\Pages\ListRecords;

class ListUserSales extends ListRecords
{
    protected static string $resource = UserSaleResource::class;

    protected function getHeaderActions(): array
    {
        return [
            CreateAction::make(),
        ];
    }
}
