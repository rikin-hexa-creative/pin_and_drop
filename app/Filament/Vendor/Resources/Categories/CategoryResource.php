<?php

namespace App\Filament\Vendor\Resources\Categories;

use App\Filament\Vendor\Resources\Categories\Pages\CreateCategory;
use App\Filament\Vendor\Resources\Categories\Pages\EditCategory;
use App\Filament\Vendor\Resources\Categories\Pages\ListCategories;
use App\Filament\Vendor\Resources\Categories\Schemas\CategoryForm;
use App\Filament\Vendor\Resources\Categories\Tables\CategoriesTable;
use App\Models\Category;
use Filament\Resources\Resource;
use Filament\Schemas\Schema;
use Filament\Support\Icons\Heroicon;
use Filament\Tables\Table;
use Illuminate\Database\Eloquent\Builder;

class CategoryResource extends Resource
{
    protected static ?string $model = Category::class;

    protected static string | \BackedEnum | null $navigationIcon = Heroicon::OutlinedTag;

    protected static string | \UnitEnum | null $navigationGroup = 'Management';

    public static function form(Schema $schema): Schema
    {
        return CategoryForm::configure($schema);
    }

    public static function table(Table $table): Table
    {
        return CategoriesTable::configure($table);
    }

    public static function getPages(): array
    {
        return [
            'index' => ListCategories::route('/'),
            'create' => CreateCategory::route('/create'),
            'edit' => EditCategory::route('/{record}/edit'),
        ];
    }

    public static function getEloquentQuery(): Builder
    {
        $vendorId = auth()->guard('vendor')->id();

        return parent::getEloquentQuery()
            ->when($vendorId, fn (Builder $query) => $query->where('created_by_vendor', $vendorId))
            ->when(! $vendorId, fn (Builder $query) => $query->whereRaw('1=0'));
    }
}
