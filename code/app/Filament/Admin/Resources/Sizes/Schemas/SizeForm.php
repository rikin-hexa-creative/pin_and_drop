<?php

namespace App\Filament\Admin\Resources\Sizes\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;

class SizeForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Size Details')
                ->schema([
                    TextInput::make('name')
                        ->required()
                        ->maxLength(50)
                        ->unique(ignoreRecord: true),
                    Toggle::make('is_active')
                        ->label('Active')
                        ->default(true),
                    TextInput::make('sort_order')
                        ->integer()
                        ->default(0),
                ])
                ->columns(3),
        ]);
    }
}
