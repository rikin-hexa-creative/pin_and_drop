<?php

namespace App\Filament\Admin\Resources\UserSales\Schemas;

use Filament\Forms\Components\DatePicker;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\FileUpload;
use Filament\Schemas\Schema;
use App\Models\UserSale;

class UserSaleForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                Select::make('user_id')
                    ->relationship('user', 'full_name')
                    ->searchable()
                    ->preload()
                    ->required(),
                TextInput::make('name')
                    ->required(),
                Textarea::make('description')
                    ->required()
                    ->columnSpanFull(),
                FileUpload::make('images')
                    ->multiple()
                    ->image()
                    ->directory('user-sales')
                    ->columnSpanFull(),
                TextInput::make('actual_price')
                    ->required()
                    ->numeric()
                    ->prefix('NRS'),
                TextInput::make('compare_at_price')
                    ->numeric()
                    ->prefix('NRS'),
                TextInput::make('condition')
                    ->required(),
                DatePicker::make('created_date'),
                Select::make('sale_status')
                    ->options(array_combine(UserSale::saleStatuses(), UserSale::saleStatuses()))
                    ->required()
                    ->default('not_sold'),
                Select::make('status')
                    ->options(array_combine(UserSale::statuses(), UserSale::statuses()))
                    ->required()
                    ->default('active'),
            ]);
    }
}
