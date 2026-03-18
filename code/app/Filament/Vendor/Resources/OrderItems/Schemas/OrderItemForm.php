<?php

namespace App\Filament\Vendor\Resources\OrderItems\Schemas;

use App\Models\OrderItem;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class OrderItemForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Order Details')
                ->schema([
                    Placeholder::make('order_number')
                        ->label('Order #')
                        ->content(fn (?OrderItem $record) => $record?->order?->order_number ?? '—'),
                    Placeholder::make('order_status')
                        ->label('Order Status')
                        ->content(fn (?OrderItem $record) => $record?->order?->status ?? '—'),
                    Placeholder::make('product_name')
                        ->label('Product')
                        ->content(fn (?OrderItem $record) => $record?->product_name ?? '—'),
                    Placeholder::make('variant_info')
                        ->label('Variant')
                        ->content(fn (?OrderItem $record) => $record?->variant_info ?? '—'),
                    Placeholder::make('quantity')
                        ->content(fn (?OrderItem $record) => $record?->quantity ?? 0),
                    Placeholder::make('unit_price')
                        ->label('Unit Price')
                        ->content(fn (?OrderItem $record) => $record ? number_format((float) $record->unit_price, 2) : '—'),
                    Placeholder::make('total_price')
                        ->label('Total Price')
                        ->content(fn (?OrderItem $record) => $record ? number_format((float) $record->total_price, 2) : '—'),
                ])
                ->columns(2),
            Section::make('Item Status')
                ->schema([
                    Select::make('item_status')
                        ->options([
                            'pending' => 'Pending',
                            'confirmed' => 'Confirmed',
                            'shipped' => 'Shipped',
                            'delivered' => 'Delivered',
                            'cancelled' => 'Cancelled',
                            'refunded' => 'Refunded',
                        ])
                        ->required(),
                ])
                ->columns(1),
        ]);
    }
}
