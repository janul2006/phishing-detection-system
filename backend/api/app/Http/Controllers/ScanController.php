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
        $startedAt = microtime(true);

        $request->validate([
            'url' => 'required|url'
        ]);

        $url = $request->input('url');

        try {
            // ⚡ Cache result (optional but powerful)
            $data = Cache::remember($url, 60, function () use ($url) {
                $aiServiceUrl = rtrim(config('services.ai.url'), '/');
                $response = Http::timeout(5)->post("{$aiServiceUrl}/predict", [
                    'url' => $url
                ]);

                if (!$response->successful()) {
                    throw new \Exception("ML service error");
                }

                return $response->json();
            });

            // 💾 Save to DB
            $scan = Scan::create([
                'url' => $url,
                'result' => $data['result'] ?? 'unknown',
                'confidence' => $data['confidence'] ?? null,
            ]);

            $elapsedMs = (int) round((microtime(true) - $startedAt) * 1000);
            $payload = [
                'url' => $url,
                'result' => $data['result'] ?? 'unknown',
                'confidence' => $data['confidence'] ?? null,
                'scanned_at' => $scan->created_at?->toISOString(),
                'scan_time_ms' => $elapsedMs,
            ];

            return response()->json([
                'success' => true,
                'data' => $payload
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
