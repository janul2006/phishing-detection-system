<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ScanController extends Controller
{
    public function scan(Request $request)
    {
        $url = $request->input('url');

        $response = Http::post('http://127.0.0.1:8001/predict', [
            'url' => $url
        ]);

        $data = $response->json();

        return response()->json($data);
    }
}