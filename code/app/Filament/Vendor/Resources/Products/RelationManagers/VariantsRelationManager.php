<?php

namespace App\Filament\Vendor\Resources\Products\RelationManagers;

use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $title = 'Variants';

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            TextInput::make('color')
                ->maxLength(50),
            TextInput::make('size')
                ->maxLength(20),
            TextInput::make('stock_qty')
                ->label('Quantity')
                ->integer()
                ->required(),
            TextInput::make('actual_price')
                ->label('Actual Price')
                ->numeric()
                ->required(),
            TextInput::make('selling_price')
                ->label('Selling Price')
                ->numeric()
                ->required(),
            TextInput::make('offer_price')
                ->label('Offer Price')
                ->numeric(),
            TextInput::make('sku')
                ->maxLength(100)
                ->unique(ignoreRecord: true),
            FileUpload::make('images')
                ->image()
                ->multiple()
                ->disk('public')
                ->directory('product-variants'),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                TextColumn::make('color')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('size')
                    ->sortable()
                    ->toggleable(),
                TextColumn::make('stock_qty')
                    ->label('Quantity')
                    ->sortable(),
                TextColumn::make('selling_price')
                    ->label('Selling Price')
                    ->formatStateUsing(fn ($state) => number_format((float) $state, 2)),
                TextColumn::make('offer_price')
                    ->label('Offer Price')
                    ->formatStateUsing(fn ($state) => $state === null ? '-' : number_format((float) $state, 2))
                    ->toggleable(),
                TextColumn::make('sku')
                    ->toggleable(),
            ])
            ->headerActions([
                CreateAction::make(),
            ])
            ->actions([
                EditAction::make(),
                DeleteAction::make(),
            ])
            ->bulkActions([
                DeleteBulkAction::make(),
            ]);
    }
}
