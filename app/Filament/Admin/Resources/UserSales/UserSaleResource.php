<?php

namespace App\Filament\Admin\Resources\UserSales;

use App\Filament\Admin\Resources\UserSales\Pages\CreateUserSale;
use App\Filament\Admin\Resources\UserSales\Pages\EditUserSale;
use App\Filament\Admin\Resources\UserSales\Pages\ListUserSales;
use App\Filament\Admin\Resources\UserSales\Schemas\UserSaleForm;
use App\Filament\Admin\Resources\UserSales\Tables\UserSalesTable;
use App\Models\UserSale;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class UserSaleResource extends Resource
{
    protected static ?string $model = UserSale::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return UserSaleForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return UserSalesTable::configure($table);
    }

    public static function getRelations(): array
    {
        return [
            //
        ];
    }

    public static function getPages(): array
    {
        return [
            'index' => ListUserSales::route('/'),
            'create' => CreateUserSale::route('/create'),
            'edit' => EditUserSale::route('/{record}/edit'),
        ];
    }
}
