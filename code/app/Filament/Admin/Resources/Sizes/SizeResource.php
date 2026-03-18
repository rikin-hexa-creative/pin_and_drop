<?php

namespace App\Filament\Admin\Resources\Sizes;

use App\Filament\Admin\Resources\Sizes\Pages\CreateSize;
use App\Filament\Admin\Resources\Sizes\Pages\EditSize;
use App\Filament\Admin\Resources\Sizes\Pages\ListSizes;
use App\Filament\Admin\Resources\Sizes\Schemas\SizeForm;
use App\Filament\Admin\Resources\Sizes\Tables\SizesTable;
use App\Models\Size;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;

class SizeResource extends Resource
{
    protected static ?string $model = Size::class;

    protected static string | \BackedEnum | null $navigationIcon = Heroicon::OutlinedTableCells;

    protected static string | \UnitEnum | null $navigationGroup = 'Products';

    protected static ?string $navigationLabel = 'Sizes';

    protected static ?string $recordTitleAttribute = 'name';

    public static function form(Schema $schema): Schema
    {
        return SizeForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return SizesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListSizes::route('/'),
            'create' => CreateSize::route('/create'),
            'edit' => EditSize::route('/{record}/edit'),
        ];
    }
}
