<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\CompanyRequest;
use App\Models\Company;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class CompanyController extends Controller
{
    /**
     * GET /company
     */
    public function show(): JsonResponse
    {
        $company = Company::first();

        return response()->json([
            'status' => true,
            'message' => 'Company info fetched successfully.',
            'data'   => $company,
        ]);
    }

    /**
     * POST /company
     * Creates the row if it doesn't exist, updates it if it does.
     */
    public function update(CompanyRequest $request): JsonResponse
    {
        $data = $request->validated();

        $company = Company::first();

        if ($request->hasFile('logo')) {
            if ($company?->logo) {
                Storage::disk('public')->delete($company->logo);
            }
            $data['logo'] = upload_with_random_name($request->file('logo'), 'companies/logos');
        }

        $company = Company::updateOrCreate([], $data);

        return response()->json([
            'status'  => true,
            'message' => 'Company saved successfully.',
            'data'    => $company->fresh(),
        ]);
    }

    /**
     * POST /company/logo
     * Replace the company logo only (no other fields touched).
     */
    public function changeLogo(Request $request): JsonResponse
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,jpg,png,webp|max:2048',
        ]);

        $company = Company::first();

        if (!$company) {
            return response()->json([
                'status'  => false,
                'message' => 'Company not found. Please set up company info first.',
            ], 404);
        }

        // Delete old logo
        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
        }

        $company->logo = upload_with_random_name($request->file('logo'), 'companies/logos');
        $company->save();

        return response()->json([
            'status'  => true,
            'message' => 'Logo updated successfully.',
            'data'    => $company->fresh(),
        ]);
    }

    /**
     * DELETE /company/logo
     * Remove the company logo.
     */
    public function deleteLogo(): JsonResponse
    {
        $company = Company::first();

        if (!$company) {
            return response()->json([
                'status'  => false,
                'message' => 'Company not found.',
            ], 404);
        }

        if ($company->logo) {
            Storage::disk('public')->delete($company->logo);
            $company->logo = null;
            $company->save();
        }

        return response()->json([
            'status'  => true,
            'message' => 'Logo removed successfully.',
            'data'    => $company->fresh(),
        ]);
    }
}
