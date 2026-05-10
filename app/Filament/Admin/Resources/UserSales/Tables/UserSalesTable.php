<?php

namespace App\Filament\Admin\Resources\UserSales\Tables;

use Filament\Actions\BulkActionGroup;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Columns\ImageColumn;
use Filament\Tables\Table;

class UserSalesTable
{
    public static function configure(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('user.full_name')
                    ->searchable()
                    ->sortable(),
                ImageColumn::make('images')
                    ->circular()
                    ->stacked()
                    ->limit(3),
                TextColumn::make('name')
                    ->searchable(),
                TextColumn::make('actual_price')
                    ->numeric()
                    ->prefix('NRS ')
                    ->sortable(),
                TextColumn::make('compare_at_price')
                    ->numeric()
                    ->prefix('NRS ')
                    ->sortable(),
                TextColumn::make('condition')
                    ->searchable(),
                TextColumn::make('created_date')
                    ->date()
                    ->sortable(),
                TextColumn::make('sale_status')
                    ->searchable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'not_sold' => 'info',
                        'sold' => 'success',
                        default => 'gray',
                    }),
                TextColumn::make('status')
                    ->searchable()
                    ->badge()
                    ->color(fn (string $state): string => match ($state) {
                        'active' => 'success',
                        'inactive' => 'danger',
                        default => 'gray',
                    }),
                TextColumn::make('created_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
                TextColumn::make('updated_at')
                    ->dateTime()
                    ->sortable()
                    ->toggleable(isToggledHiddenByDefault: true),
            ])
            ->filters([
                //
            ])
            ->recordActions([
                EditAction::make(),
            ])
            ->toolbarActions([
                BulkActionGroup::make([
                    DeleteBulkAction::make(),
                ]),
            ]);
    }
}
