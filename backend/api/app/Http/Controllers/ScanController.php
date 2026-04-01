<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Cache;
use App\Models\Scan;

class ScanController extends Controller
{
    public function scan(Request $request)
    {
        $validated = $request->validate([
            'url' => ['required', 'url'],
        ]);

        $url = $validated['url'];

        $result = Cache::store('file')->remember('scan_' . md5($url), 60, function () use ($url) {

            // Call FastAPI ONLY if not cached
            $response = Http::post('http://127.0.0.1:8001/predict', [
                'url' => $url
            ]);

            $response->throw();

            return $response->json();
        });

        // Save to DB
        Scan::create([
            'url' => $url,
            'result' => $result['result'],
            'confidence' => $result['confidence'] ?? null
        ]);

        return response()->json($result);
    }
}
