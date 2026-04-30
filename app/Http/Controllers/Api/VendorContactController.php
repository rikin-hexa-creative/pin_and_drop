<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\VendorContact;
use Illuminate\Http\Request;

class VendorContactController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'business_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'message' => 'nullable|string',
        ]);

        $vendorContact = VendorContact::create($validated);

        return response()->json([
            'message' => 'Application submitted successfully.',
            'data' => $vendorContact
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(VendorContact $vendorContact)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, VendorContact $vendorContact)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(VendorContact $vendorContact)
    {
        //
    }
}
