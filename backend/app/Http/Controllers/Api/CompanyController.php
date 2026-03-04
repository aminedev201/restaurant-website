<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Company;
use Illuminate\Http\JsonResponse;

class CompanyController extends Controller
{
    public function getCompanyInfo(): JsonResponse
    {
        $company = Company::first();

        return response()->json([
            'status' => true,
            'data'   => $company,
        ]);
    }

}
