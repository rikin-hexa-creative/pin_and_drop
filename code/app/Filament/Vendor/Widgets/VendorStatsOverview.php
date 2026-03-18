<?php

namespace App\Filament\Vendor\Widgets;

use App\Models\OrderItem;
use App\Models\Product;
use Filament\Widgets\StatsOverviewWidget;
use Filament\Widgets\StatsOverviewWidget\Stat;

class VendorStatsOverview extends StatsOverviewWidget
{
    protected function getStats(): array
    {
        $vendorId = auth()->guard('vendor')->id();

        if (! $vendorId) {
            return [];
        }

        $totalProducts = Product::query()
            ->where('vendor_id', $vendorId)
            ->count();

        $totalOrders = OrderItem::query()
            ->where('vendor_id', $vendorId)
            ->distinct('order_id')
            ->count('order_id');

        $totalSales = OrderItem::query()
            ->where('vendor_id', $vendorId)
            ->sum('total_price');

        return [
            Stat::make('Total Products', (string) $totalProducts),
            Stat::make('Total Orders', (string) $totalOrders),
            Stat::make('Total Sales', number_format((float) $totalSales, 2)),
        ];
    }
}
