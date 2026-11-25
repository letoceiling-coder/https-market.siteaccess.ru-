<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Redis;
use Throwable;

class HealthController extends Controller
{
    public function __invoke()
    {
        $checks = [
            'app' => true,
            'database' => $this->database(),
            'redis' => $this->redis(),
        ];

        $ok = ! in_array(false, $checks, true);

        return response()->json([
            'data' => [
                'service' => 'helphomes-api',
                'status' => $ok ? 'ok' : 'degraded',
                'checks' => $checks,
            ],
        ], $ok ? 200 : 503);
    }

    private function database(): bool
    {
        try {
            DB::connection()->getPdo();

            return true;
        } catch (Throwable) {
            return false;
        }
    }

    private function redis(): bool
    {
        try {
            $pong = Redis::connection()->ping();

            return $pong === true
                || $pong === 1
                || strtoupper(trim((string) $pong, '+ ')) === 'PONG';
        } catch (Throwable) {
            return false;
        }
    }
}
