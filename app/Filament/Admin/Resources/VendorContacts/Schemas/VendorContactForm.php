<?php

namespace App\Filament\Admin\Resources\VendorContacts\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Forms\Components\Textarea;
use Filament\Schemas\Schema;

class VendorContactForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('business_name')
                    ->required(),
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                TextInput::make('phone')
                    ->tel(),
                Textarea::make('message')
                    ->columnSpanFull(),
                \Filament\Forms\Components\Select::make('status')
                    ->options([
                        'pending' => 'Pending',
                        'reviewed' => 'Reviewed',
                        'accepted' => 'Accepted',
                        'rejected' => 'Rejected',
                    ])
                    ->required()
                    ->default('pending'),
            ]);
    }
}
