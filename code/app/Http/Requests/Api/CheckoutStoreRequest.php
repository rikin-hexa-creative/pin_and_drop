<?php

namespace App\Http\Requests\Api;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CheckoutStoreRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'product_id' => ['required', 'integer', 'exists:products,id'],
            'variant_id' => ['required', 'integer', 'exists:product_variants,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:25'],
            'payment_method' => [
                'required',
                Rule::in(['cod', 'stripe', 'paypal', 'bank_transfer', 'jazzcash', 'easypaisa']),
            ],
            'notes' => ['nullable', 'string', 'max:1000'],
            'save_as_default' => ['nullable', 'boolean'],
            'shipping_address' => ['required', 'array'],
            'shipping_address.label' => ['nullable', 'string', 'max:50'],
            'shipping_address.full_name' => ['required', 'string', 'max:100'],
            'shipping_address.phone' => ['required', 'string', 'max:20'],
            'shipping_address.address_line1' => ['required', 'string', 'max:255'],
            'shipping_address.address_line2' => ['nullable', 'string', 'max:255'],
            'shipping_address.city' => ['required', 'string', 'max:100'],
            'shipping_address.state' => ['nullable', 'string', 'max:100'],
            'shipping_address.postal_code' => ['required', 'string', 'max:20'],
            'shipping_address.country' => ['required', 'string', 'max:100'],
        ];
    }

    public function messages(): array
    {
        return [
            'variant_id.required' => 'Select a product size or color before checkout.',
        ];
    }
}
