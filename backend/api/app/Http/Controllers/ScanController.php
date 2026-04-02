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
        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->input('url');

        try {

            // ⚡ Cache result (optional but powerful)
            $data = Cache::remember($url, 60, function () use ($url) {

                $response = Http::timeout(5)->post('http://127.0.0.1:8000/predict', [
                    'url' => $url
                ]);

                if (!$response->successful()) {
                    throw new \Exception("ML service error");
                }

                return $response->json();
            });

            // 💾 Save to DB
            Scan::create([
                'url' => $url,
                'result' => $data['result']
            ]);

            return response()->json([
                'success' => true,
                'data' => $data
            ]);

        } catch (\Exception $e) {

            return response()->json([
                'success' => false,
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function history(Request $request)
    {
    $query = Scan::query();

    if ($request->has('result')) {
        $query->where('result', $request->result);
    }

    $scans = $query->latest()->paginate(10);

    return response()->json([
        'success' => true,
        'data' => $scans
    ]);
    }
    

}