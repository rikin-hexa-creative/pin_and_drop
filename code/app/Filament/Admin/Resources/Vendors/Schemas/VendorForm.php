<?php

namespace App\Filament\Admin\Resources\Vendors\Schemas;

use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Components\Section;
use Filament\Schemas\Components\Utilities\Set;
use Filament\Schemas\Schema;
use Illuminate\Support\Str;

class VendorForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema->components([
            Section::make('Vendor Details')
                ->schema([
                    TextInput::make('business_name')
                        ->required()
                        ->maxLength(150)
                        ->live(onBlur: true)
                        ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state))),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(160)
                        ->unique(ignoreRecord: true),
                    TextInput::make('email')
                        ->email()
                        ->required()
                        ->maxLength(150)
                        ->unique(ignoreRecord: true),
                    TextInput::make('password')
                        ->password()
                        ->maxLength(255)
                        ->dehydrated(fn ($state) => filled($state))
                        ->required(fn (string $context) => $context === 'create'),
                    TextInput::make('phone')
                        ->maxLength(20),
                    FileUpload::make('logo')
                        ->image()
                        ->disk('public')
                        ->directory('vendors/logos'),
                    FileUpload::make('banner')
                        ->image()
                        ->disk('public')
                        ->directory('vendors/banners'),
                    Textarea::make('description')
                        ->columnSpanFull(),
                ])
                ->columns(2),
            Section::make('Status')
                ->schema([
                    Select::make('status')
                        ->options([
                            'pending' => 'Pending',
                            'approved' => 'Approved',
                            'suspended' => 'Suspended',
                        ])
                        ->required(),
                ]),
        ]);
    }
}
