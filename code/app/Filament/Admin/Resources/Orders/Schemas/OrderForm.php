<?php

namespace App\Filament\Admin\Resources\Orders\Schemas;

use App\Models\Order;
use Filament\Forms\Components\Placeholder;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\Repeater;
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
                        ->content(fn (?Order $record) => $record?->order_number ?? '—'),
                    Placeholder::make('customer_name')
                        ->label('Customer')
                        ->content(fn (?Order $record) => $record?->user?->full_name ?? '—'),
                    Placeholder::make('grand_total')
                        ->label('Total Amount')
                        ->content(fn (?Order $record) => $record ? '$' . number_format((float) $record->grand_total, 2) : '—'),
                    Placeholder::make('created_at')
                        ->label('Order Date')
                        ->content(fn (?Order $record) => $record?->created_at?->format('M d, Y h:i A') ?? '—'),
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
                            if (!$record || !$record->shippingAddress) {
                                return '—';
                            }
                            $addr = $record->shippingAddress;
                            return new HtmlString(nl2br(e(
                                $addr->full_name . "\n" . 
                                $addr->address_line1 . "\n" . 
                                ($addr->address_line2 ? $addr->address_line2 . "\n" : '') . 
                                $addr->city . ', ' . $addr->state . ' ' . $addr->postal_code . "\n" . 
                                $addr->country . "\n" . 
                                'Phone: ' . $addr->phone
                            )));
                        }),
                ]),

            Section::make('Order Items')
                ->schema([
                    Repeater::make('items')
                        ->relationship('items')
                        ->schema([
                            Placeholder::make('product_name')
                                ->label('Item')
                                ->content(fn ($record) => $record?->product_name ?? '—'),
                            Placeholder::make('vendor')
                                ->label('Vendor')
                                ->content(fn ($record) => $record?->vendor?->business_name ?? '—'),
                            Placeholder::make('quantity')
                                ->label('Qty')
                                ->content(fn ($record) => $record?->quantity ?? '—'),
                            Placeholder::make('total_price')
                                ->label('Total')
                                ->content(fn ($record) => $record ? '$' . number_format((float) $record->total_price, 2) : '—'),
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
                        ->columns(5)
                        ->addable(false)
                        ->deletable(false)
                        ->reorderable(false)
                ])
        ]);
    }
}
