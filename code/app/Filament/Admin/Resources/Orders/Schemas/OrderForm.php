<?php

namespace App\Filament\Admin\Resources\Orders\Schemas;

use App\Models\Order;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\Select;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Schema;
use Illuminate\Support\HtmlString;

class OrderForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Order Summary')
                ->schema([
                    Placeholder::make('order_number')
                        ->label('Order #')
                        ->content(fn (?Order $record) => $record?->order_number ?? '-'),
                    Placeholder::make('customer_name')
                        ->label('Customer')
                        ->content(fn (?Order $record) => $record?->user?->full_name ?? '-'),
                    Placeholder::make('items_count')
                        ->label('Items')
                        ->content(fn (?Order $record) => $record?->items?->count() ?? 0),
                    Placeholder::make('grand_total')
                        ->label('Total Amount')
                        ->content(fn (?Order $record) => self::formatAmount($record?->grand_total)),
                    Placeholder::make('sources')
                        ->label('Order Sources')
                        ->content(function (?Order $record): string {
                            $sources = $record?->items
                                ?->pluck('item_source')
                                ->filter()
                                ->unique()
                                ->map(fn (string $source) => $source === 'user_sale' ? 'User Sale' : 'Catalog Product')
                                ->values()
                                ->all() ?? [];

                            return $sources ? implode(', ', $sources) : '-';
                        }),
                    Placeholder::make('created_at')
                        ->label('Order Date')
                        ->content(fn (?Order $record) => $record?->created_at?->format('M d, Y h:i A') ?? '-'),
                ])->columns(2),

            Section::make('Order Status')
                ->schema([
                    Select::make('status')
                        ->options([
                            'pending' => 'Pending',
                            'confirmed' => 'Confirmed',
                            'processing' => 'Processing',
                            'shipped' => 'Shipped',
                            'delivered' => 'Delivered',
                            'cancelled' => 'Cancelled',
                            'refunded' => 'Refunded',
                        ])
                        ->required(),
                ])->columns(1),

            Section::make('Shipping Details')
                ->schema([
                    Placeholder::make('shipping_address')
                        ->label('Address')
                        ->content(function (?Order $record) {
                            if (! $record || ! $record->shippingAddress) {
                                return '-';
                            }

                            $address = $record->shippingAddress;

                            return new HtmlString(nl2br(e(
                                $address->full_name . "\n" .
                                $address->address_line1 . "\n" .
                                ($address->address_line2 ? $address->address_line2 . "\n" : '') .
                                $address->city . ', ' . $address->state . ' ' . $address->postal_code . "\n" .
                                $address->country . "\n" .
                                'Phone: ' . $address->phone
                            )));
                        }),
                ]),

            Section::make('Order Items')
                ->schema([
                    Repeater::make('items')
                        ->relationship('items')
                        ->schema([
                            Placeholder::make('item_source')
                                ->label('Source')
                                ->content(fn ($record) => self::sourceLabel($record)),
                            Placeholder::make('product_name')
                                ->label('Item')
                                ->content(fn ($record) => $record?->product_name ?? '-'),
                            Placeholder::make('reference')
                                ->label('Reference')
                                ->content(fn ($record) => self::referenceLabel($record)),
                            Placeholder::make('seller_or_vendor')
                                ->label('Seller / Vendor')
                                ->content(fn ($record) => self::sellerLabel($record)),
                            Placeholder::make('variant_info')
                                ->label('Details')
                                ->content(fn ($record) => $record?->variant_info ?? 'Standard item'),
                            Placeholder::make('quantity')
                                ->label('Qty')
                                ->content(fn ($record) => $record?->quantity ?? '-'),
                            Placeholder::make('unit_price')
                                ->label('Unit Price')
                                ->content(fn ($record) => self::formatAmount($record?->unit_price)),
                            Placeholder::make('total_price')
                                ->label('Total')
                                ->content(fn ($record) => self::formatAmount($record?->total_price)),
                            Select::make('item_status')
                                ->label('Item Status')
                                ->options([
                                    'pending' => 'Pending',
                                    'confirmed' => 'Confirmed',
                                    'shipped' => 'Shipped',
                                    'delivered' => 'Delivered',
                                    'cancelled' => 'Cancelled',
                                    'refunded' => 'Refunded',
                                ])
                                ->required(),
                        ])
                        ->columns(4)
                        ->addable(false)
                        ->deletable(false)
                        ->reorderable(false),
                ]),
        ]);
    }

    private static function formatAmount($amount): string
    {
        return $amount !== null
            ? 'NRS ' . number_format((float) $amount, 2)
            : '-';
    }

    private static function sourceLabel($record): string
    {
        return ($record?->item_source ?? 'product') === 'user_sale'
            ? 'User Sale'
            : 'Catalog Product';
    }

    private static function referenceLabel($record): string
    {
        if (($record?->item_source ?? 'product') === 'user_sale') {
            return $record?->user_sale_id ? 'Sale Listing #' . $record->user_sale_id : '-';
        }

        return $record?->product_id ? 'Product #' . $record->product_id : '-';
    }

    private static function sellerLabel($record): string
    {
        return $record?->vendor?->business_name
            ?? $record?->seller_name
            ?? $record?->saleSeller?->full_name
            ?? '-';
    }
}
