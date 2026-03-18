<?php

namespace App\Filament\Vendor\Resources\OrderItems;

use App\Filament\Vendor\Resources\OrderItems\Pages\EditOrderItem;
use App\Filament\Vendor\Resources\OrderItems\Pages\ListOrderItems;
use App\Filament\Vendor\Resources\OrderItems\Schemas\OrderItemForm;
use App\Filament\Vendor\Resources\OrderItems\Tables\OrderItemsTable;
use App\Models\OrderItem;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class OrderItemResource extends Resource
{
    protected static ?string $model = OrderItem::class;

    protected static string | \BackedEnum | null $navigationIcon = Heroicon::OutlinedShoppingBag;

    protected static string | \UnitEnum | null $navigationGroup = 'Management';

    protected static ?string $navigationLabel = 'Orders';

    protected static ?string $recordTitleAttribute = 'product_name';

    public static function canCreate(): bool
    {
        return false;
    }

    public static function form(Schema $schema): Schema
    {
        return OrderItemForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return OrderItemsTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListOrderItems::route('/'),
            'edit' => EditOrderItem::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $vendorId = auth()->guard('vendor')->id();

        return parent::getEloquentQuery()
            ->when($vendorId, fn (Builder $query) => $query->where('vendor_id', $vendorId));
    }
}
