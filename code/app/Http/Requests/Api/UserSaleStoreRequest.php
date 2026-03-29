<?php

namespace App\Http\Requests\Api;

use App\Models\UserSale;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UserSaleStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'images' => ['required', 'array', 'min:1', 'max:8'],
            'images.*' => ['required', 'image', 'mimes:jpg,jpeg,png,webp', 'max:5120'],
            'name' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string', 'max:5000'],
            'actual_price' => ['required', 'numeric', 'min:0'],
            'compare_at_price' => ['nullable', 'numeric', 'gte:actual_price'],
            'condition' => ['required', 'string', 'max:100'],
            'created_date' => ['nullable', 'date'],
            'sale_status' => ['required', Rule::in(UserSale::saleStatuses())],
            'status' => ['required', Rule::in(UserSale::statuses())],
        ];
    }
}
