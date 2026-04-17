<?php

namespace App\Filament\Vendor\Resources\Products\Schemas;

use Filament\Forms\Components\Hidden;
use Filament\Forms\Components\FileUpload;
use Filament\Forms\Components\Repeater;
use Filament\Forms\Components\RichEditor;
use Filament\Forms\Components\Select;
use Filament\Forms\Components\TextInput;
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
                        ->afterStateUpdated(fn (Set $set, ?string $state) => $set('slug', Str::slug((string) $state)))
                        ->columnSpan(2),
                    TextInput::make('slug')
                        ->required()
                        ->maxLength(220)
                        ->unique(ignoreRecord: true)
                        ->columnSpan(1),
                    TextInput::make('sku')
                        ->maxLength(100)
                        ->unique(ignoreRecord: true)
                        ->columnSpan(1),
                    Select::make('category_id')
                        ->relationship('category', 'name', fn (Builder $query) => $query->approved()->active())
                        ->searchable()
                        ->preload()
                        ->required()
                        ->columnSpan(1),
                    Select::make('status')
                        ->options([
                            'draft' => 'Draft',
                            'active' => 'Active',
                            'inactive' => 'Inactive',
                            'rejected' => 'Rejected',
                        ])
                        ->required()
                        ->columnSpan(1),
                    Toggle::make('is_featured')
                        ->label('Featured')
                        ->columnSpan(1),
                    RichEditor::make('description')
                        ->label('Description')
                        ->extraInputAttributes(['style' => 'min-height: 160px'])
                        ->columnSpanFull(),
                    Hidden::make('base_price')
                        ->default(0),
                    Hidden::make('discount_price')
                        ->default(null),
                ])
                ->columns(3)
                ->columnSpanFull(),
            Section::make('Card Images')
                ->schema([
                    Repeater::make('images')
                        ->relationship()
                        ->orderColumn('sort_order')
                        ->schema([
                            FileUpload::make('image_url')
                                ->image()
                                ->disk('public')
                                ->visibility('public')
                                ->directory('products')
                                ->required()
                                ->imageEditor()
                                ->imageEditorAspectRatioOptions([
                                    null,
                                    '1:1',
                                    '3:4',
                                    '4:5',
                                    '16:9',
                                ])
                                ->openable()
                                ->downloadable()
                                ->imagePreviewHeight('140')
                                ->columnSpanFull(),
                            Toggle::make('is_primary')
                                ->label('Primary')
                                ->default(false),
                            TextInput::make('sort_order')
                                ->integer()
                                ->default(0),
                        ])
                        ->addActionLabel('Add Image')
                        ->columns(2)
                        ->columnSpanFull(),
                ])
                ->columnSpanFull(),
            Section::make('Size Chart')
                ->schema([
                    RichEditor::make('size_chart')
                        ->label('Size Chart')
                        ->helperText('Insert a table using the editor tools.')
                        ->extraInputAttributes([
                            'style' => 'min-height: 240px',
                            'class' => 'size-chart-editor',
                        ])
                        ->afterStateHydrated(function (Set $set, $state): void {
                            if (! is_array($state)) {
                                return;
                            }

                            $headers = array_values(array_filter(array_map(
                                fn ($item) => is_array($item) ? ($item['label'] ?? null) : null,
                                $state['headers'] ?? []
                            )));

                            $rows = $state['rows'] ?? [];
                            $hasRowLabels = false;

                            foreach ($rows as $row) {
                                if (! empty($row['label'])) {
                                    $hasRowLabels = true;
                                    break;
                                }
                            }

                            if (empty($headers) && empty($rows)) {
                                $set('size_chart', null);
                                return;
                            }

                            $html = '<table><thead><tr>';
                            if ($hasRowLabels) {
                                $html .= '<th></th>';
                            }
                            foreach ($headers as $header) {
                                $html .= '<th>' . htmlspecialchars((string) $header, ENT_QUOTES, 'UTF-8') . '</th>';
                            }
                            $html .= '</tr></thead><tbody>';

                            foreach ($rows as $row) {
                                $html .= '<tr>';
                                if ($hasRowLabels) {
                                    $label = is_array($row) ? ($row['label'] ?? '') : '';
                                    $html .= '<td>' . htmlspecialchars((string) $label, ENT_QUOTES, 'UTF-8') . '</td>';
                                }
                                $cells = is_array($row) ? ($row['cells'] ?? []) : [];
                                foreach ($cells as $cell) {
                                    $value = is_array($cell) ? ($cell['value'] ?? '') : '';
                                    $html .= '<td>' . htmlspecialchars((string) $value, ENT_QUOTES, 'UTF-8') . '</td>';
                                }
                                $html .= '</tr>';
                            }

                            $html .= '</tbody></table>';

                            $set('size_chart', $html);
                        })
                        ->columnSpanFull(),
                ])
                ->columnSpanFull(),
        ]);
    }
}
