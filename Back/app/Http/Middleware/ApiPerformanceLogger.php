<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ApiPerformanceLogger
{
    public function handle(Request $request, Closure $next)
    {
        $startTime = microtime(true);
        $startMemory = memory_get_usage(true);

        // Habilitar log de queries para medir cantidad y tiempo total
        DB::enableQueryLog();

        $response = $next($request);

        $durationMs = (microtime(true) - $startTime) * 1000.0;
        $memoryMb = (memory_get_usage(true) - $startMemory) / (1024 * 1024);

        $queries = DB::getQueryLog();
        DB::disableQueryLog();

        $queryCount = is_array($queries) ? count($queries) : 0;
        $dbTimeMs = 0.0;
        if (is_array($queries)) {
            foreach ($queries as $q) {
                $dbTimeMs += isset($q['time']) ? (float)$q['time'] : 0.0;
            }
        }

        $user = $request->user();
        $userId = $user?->id_alumno ?? $user?->id ?? null;

        Log::info('API PERF', [
            'method' => $request->getMethod(),
            'path' => $request->path(),
            'status' => method_exists($response, 'getStatusCode') ? $response->getStatusCode() : null,
            'duration_ms' => round($durationMs, 2),
            'db_time_ms' => round($dbTimeMs, 2),
            'db_query_count' => $queryCount,
            'memory_mb' => round($memoryMb, 2),
            'user_id' => $userId,
        ]);

        return $response;
    }
}


