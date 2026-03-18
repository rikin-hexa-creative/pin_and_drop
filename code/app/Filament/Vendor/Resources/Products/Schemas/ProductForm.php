<?php

namespace App\Filament\Vendor\Resources\Products\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Forms\Components\Toggle;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;

class ProductForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Product Details')
                ->schema([
                    Hidden::make('vendor_id')
                        ->default(fn () => auth()->guard('vendor')->id())
                        ->required(),
                    TextInput::make('name')
                        ->required()
                        ->maxLength(200)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(220)
                        ->unique(ignoreRecord: true),
                    TextInput::make('sku')
                        ->maxLength(100)
                        ->unique(ignoreRecord: true),
                    Select::make('category_id')
                        ->relationship('category', 'name', fn (Builder $query) => $query->approved()->active())
                        ->searchable()
                        ->preload()
                        ->required(),
                    Textarea::make('description')
                        ->columnSpanFull(),
                    Hidden::make('base_price')
                        ->default(0),
                    Hidden::make('discount_price')
                        ->default(null),
                ])
                ->columns(2),
            Section::make('Status')
                ->schema([
                    Select::make('status')
                        ->options([
                            'draft' => 'Draft',
                            'active' => 'Active',
                            'inactive' => 'Inactive',
                            'rejected' => 'Rejected',
                        ])
                        ->required(),
                    Toggle::make('is_featured')
                        ->label('Featured'),
                ])
                ->columns(2),
            Section::make('Card Images')
                ->schema([
                    Repeater::make('images')
                        ->relationship()
                        ->orderColumn('sort_order')
                        ->schema([
                            FileUpload::make('image_url')
                                ->image()
                                ->disk('public')
                                ->directory('products')
                                ->required(),
                            Toggle::make('is_primary')
                                ->label('Primary')
                                ->default(false),
                            TextInput::make('sort_order')
                                ->integer()
                                ->default(0),
                        ])
                        ->addActionLabel('Add Image')
                        ->columns(3)
                        ->columnSpanFull(),
                ]),
            Section::make('Size Chart')
                ->schema([
                    Repeater::make('headers')
                        ->label('Columns')
                        ->schema([
                            TextInput::make('label')
                                ->required()
                                ->maxLength(50),
                        ])
                        ->default([])
                        ->addActionLabel('Add Column'),
                    Repeater::make('rows')
                        ->label('Rows')
                        ->schema([
                            TextInput::make('label')
                                ->label('Row Label')
                                ->required()
                                ->maxLength(50),
                            Repeater::make('cells')
                                ->label('Cells')
                                ->schema([
                                    TextInput::make('value')
                                        ->required()
                                        ->maxLength(50),
                                ])
                                ->default([])
                                ->addActionLabel('Add Cell'),
                        ])
                        ->default([])
                        ->addActionLabel('Add Row'),
                ])
                ->statePath('size_chart'),
        ]);
    }
}
