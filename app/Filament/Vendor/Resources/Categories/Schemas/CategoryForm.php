<?php

namespace App\Filament\Vendor\Resources\Categories\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class CategoryForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Category Details')
                ->schema([
                    Hidden::make('created_by_vendor')
                        ->default(fn () => auth()->guard('vendor')->id())
                        ->required(),
                    Hidden::make('is_active')
                        ->default(false),
                    Hidden::make('is_approved')
                        ->default(false),
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
                        ->relationship('parent', 'name', fn (Builder $query) => $query->approved()->active())
                        ->searchable()
                        ->preload()
                        ->nullable(),
                    FileUpload::make('image')
                        ->image()
                        ->disk('public')
                        ->visibility('public')
                        ->directory('categories'),
                    TextInput::make('sort_order')
                        ->integer()
                        ->default(0),
                ])
                ->columns(2),
        ]);
    }
}
