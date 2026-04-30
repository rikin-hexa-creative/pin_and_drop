<?php

namespace App\Filament\Admin\Resources\Subscribers\Schemas;

use Filament\Forms\Components\TextInput;
use Filament\Schemas\Schema;

class SubscriberForm
{
    public static function configure(Schema $schema): Schema
    {
        return $schema
            ->components([
                TextInput::make('email')
                    ->label('Email address')
                    ->email()
                    ->required(),
                \Filament\Forms\Components\Select::make('status')
                    ->options([
                        'subscribed' => 'Subscribed',
                        'unsubscribed' => 'Unsubscribed',
                    ])
                    ->required()
                    ->default('subscribed'),
            ]);
    }
}
