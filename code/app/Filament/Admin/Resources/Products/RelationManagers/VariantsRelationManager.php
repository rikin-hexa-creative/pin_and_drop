<?php

namespace App\Filament\Admin\Resources\Products\RelationManagers;

use App\Models\Size;
use Filament\Actions\CreateAction;
use Filament\Actions\DeleteAction;
use Filament\Actions\DeleteBulkAction;
use Filament\Actions\EditAction;
use Filament\Forms\Components\ColorPicker;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Resources\RelationManagers\RelationManager;
use Filament\Schemas\Schema;
use Filament\Tables\Columns\ColorColumn;
use Filament\Tables\Columns\TextColumn;
use Filament\Tables\Table;

class VariantsRelationManager extends RelationManager
{
    protected static string $relationship = 'variants';

    protected static ?string $title = 'Variants';

    public function form(Schema $schema): Schema
    {
        return $schema->components([
            ColorPicker::make('color')
                ->label('Color')
                ->hex(),
            Select::make('size')
                ->label('Size')
                ->options(fn () => Size::query()->active()->ordered()->pluck('name', 'name')->all())
                ->searchable()
                ->preload()
                ->nullable(),
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
                ->directory('product-variants')
                ->openable()
                ->downloadable()
                ->imagePreviewHeight('120'),
        ])->columns(2);
    }

    public function table(Table $table): Table
    {
        return $table
            ->columns([
                ColorColumn::make('color')
                    ->label('Color')
                    ->copyable()
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
                CreateAction::make()
                    ->label('Add Variant')
                    ->fillForm(function (CreateAction $action): array {
                        $livewire = $action->getLivewire();

                        if (! method_exists($livewire, 'getOwnerRecord')) {
                            return [];
                        }

                        $owner = $livewire->getOwnerRecord();
                        $last = $owner?->variants()->latest()->first();

                        if (! $last) {
                            return [];
                        }

                        return [
                            'color' => $last->color,
                            'size' => $last->size,
                            'stock_qty' => $last->stock_qty,
                            'actual_price' => $last->actual_price,
                            'selling_price' => $last->selling_price,
                            'offer_price' => $last->offer_price,
                            'images' => $last->images ?? [],
                        ];
                    })
                    ->preserveFormDataWhenCreatingAnother([
                        'color',
                        'size',
                        'stock_qty',
                        'actual_price',
                        'selling_price',
                        'offer_price',
                        'images',
                    ]),
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
