<?php

namespace App\Filament\Vendor\Resources\OrderItems\Tables;

use Filament\Actions\EditAction;
use Filament\Tables;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Filters\SelectFilter;
use Filament\Tables\Table;

class OrderItemsTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('order.order_number')
                    ->label('Order #')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('product_name')
                    ->label('Product')
                    ->searchable()
                    ->sortable(),
                TextColumn::make('variant_info')
                    ->label('Variant')
                    ->toggleable(),
                TextColumn::make('quantity')
                    ->sortable(),
                TextColumn::make('total_price')
                    ->label('Total')
                    ->formatStateUsing(fn ($state) => number_format((float) $state, 2))
                    ->sortable(),
                TextColumn::make('item_status')
                    ->label('Item Status')
                    ->badge()
                    ->sortable(),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                SelectFilter::make('item_status')
                    ->options([
                        'pending' => 'Pending',
                        'confirmed' => 'Confirmed',
                        'shipped' => 'Shipped',
                        'delivered' => 'Delivered',
                        'cancelled' => 'Cancelled',
                        'refunded' => 'Refunded',
                    ]),
            ])
            ->actions([
                EditAction::make(),
            ])
            ->bulkActions([])
            ->defaultSort('created_at', 'desc');
    }
}
