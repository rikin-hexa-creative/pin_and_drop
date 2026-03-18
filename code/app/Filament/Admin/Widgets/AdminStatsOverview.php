<?php

namespace App\Filament\Admin\Widgets;

use App\Models\Category;
use App\Models\Product;
use App\Models\User;
use App\Models\Vendor;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class AdminStatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        return [
            Stat::make('Total Vendors', (string) Vendor::query()->count()),
            Stat::make('Total Users', (string) User::query()->count()),
            Stat::make('Total Products', (string) Product::query()->count()),
            Stat::make('Total Categories', (string) Category::query()->count()),
        ];
    }
}
