<?php

namespace App\Filament\Admin\Resources\Categories\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Category Details')
                ->schema([
                    Hidden::make('created_by')
                        ->default(fn () => auth()->guard('admin')->id())
                        ->required(),
                    TextInput::make('name')
                        ->required()
                        ->maxLength(100)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(110)
                        ->unique(ignoreRecord: true),
                    Select::make('parent_id')
                        ->relationship('parent', 'name')
                        ->searchable()
                        ->preload()
                        ->nullable(),
                    FileUpload::make('image')
                        ->image()
                        ->disk('public')
                        ->directory('categories'),
                    TextInput::make('sort_order')
                        ->integer()
                        ->default(0),
                    Toggle::make('is_active')
                        ->label('Active')
                        ->default(true),
                    Toggle::make('is_approved')
                        ->label('Approved')
                        ->default(true),
                ])
                ->columns(2),
        ]);
    }
}
