<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;

class ProductIndexRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => ['nullable', 'string', 'max:120'],
            'category' => ['nullable', 'array'],
            'category.*' => ['integer', 'exists:categories,id'],
            'designer' => ['nullable', 'array'],
            'designer.*' => ['string', 'max:150'],
            'size' => ['nullable', 'array'],
            'size.*' => ['string', 'max:50'],
            'color' => ['nullable', 'array'],
            'color.*' => ['string', 'max:50'],
            'sort' => ['nullable', 'in:latest,price_asc,price_desc'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0', 'gte:min_price'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }
}
