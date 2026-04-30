<?php

namespace App\Filament\Admin\Resources\VendorContacts;

use App\Filament\Admin\Resources\VendorContacts\Pages\CreateVendorContact;
use App\Filament\Admin\Resources\VendorContacts\Pages\EditVendorContact;
use App\Filament\Admin\Resources\VendorContacts\Pages\ListVendorContacts;
use App\Filament\Admin\Resources\VendorContacts\Pages\ViewVendorContact;
use App\Filament\Admin\Resources\VendorContacts\Schemas\VendorContactForm;
use App\Filament\Admin\Resources\VendorContacts\Schemas\VendorContactInfolist;
use App\Filament\Admin\Resources\VendorContacts\Tables\VendorContactsTable;
use App\Models\VendorContact;
use BackedEnum;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class VendorContactResource extends Resource
{
    protected static ?string $model = VendorContact::class;

    protected static string|BackedEnum|null $navigationIcon = Heroicon::OutlinedRectangleStack;

    protected static ?string $recordTitleAttribute = 'business_name';

    public static function form(Schema $schema): Schema
    {
        return VendorContactForm::configure($schema);
    }

    public static function infolist(Schema $schema): Schema
    {
        return VendorContactInfolist::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return VendorContactsTable::configure($table);
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
            'index' => ListVendorContacts::route('/'),
            'create' => CreateVendorContact::route('/create'),
            'view' => ViewVendorContact::route('/{record}'),
            'edit' => EditVendorContact::route('/{record}/edit'),
        ];
    }
}
