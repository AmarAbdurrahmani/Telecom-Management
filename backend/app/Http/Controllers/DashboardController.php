<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Fature;
use App\Models\NumriTelefonit;
use App\Models\Kontrate;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function stats()
    {
        $now = Carbon::now();

        // ── Top 4 KPIs ────────────────────────────────────────────────────────
        $totalKlientet  = Client::count();
        $klientetAktiv  = Client::where('statusi', 'aktiv')->count();

        // Invoices issued this month
        $faturatMuajit  = Fature::whereYear('data_leshimit', $now->year)
                                 ->whereMonth('data_leshimit', $now->month)
                                 ->count();

        $borxhiTotal    = Fature::whereIn('statusi', ['e_papaguar', 'e_vonuar'])
                                 ->sum('totali');

        $numratAktiv    = NumriTelefonit::where('statusi', 'aktiv')->count();

        // ── Revenue last 6 months ────────────────────────────────────────────
        $months = collect(range(5, 0))->map(function ($i) use ($now) {
            $m = $now->copy()->subMonths($i);
            return [
                'label'  => $m->locale('sq')->isoFormat('MMM YY'),
                'year'   => $m->year,
                'month'  => $m->month,
            ];
        });

        $revenueRows = Fature::selectRaw(
            'YEAR(data_leshimit) as yr, MONTH(data_leshimit) as mn,
             SUM(totali) as total, COUNT(*) as count,
             SUM(CASE WHEN statusi="e_paguar" THEN totali ELSE 0 END) as paguar,
             SUM(CASE WHEN statusi IN ("e_papaguar","e_vonuar") THEN totali ELSE 0 END) as borxh'
        )
        ->whereRaw('data_leshimit >= ?', [$now->copy()->subMonths(5)->startOfMonth()])
        ->groupByRaw('YEAR(data_leshimit), MONTH(data_leshimit)')
        ->get()
        ->keyBy(fn($r) => "{$r->yr}-{$r->mn}");

        $revenue = $months->map(function ($m) use ($revenueRows) {
            $key = "{$m['year']}-{$m['month']}";
            $row = $revenueRows[$key] ?? null;
            return [
                'label'  => $m['label'],
                'total'  => round($row?->total ?? 0, 2),
                'paguar' => round($row?->paguar ?? 0, 2),
                'borxh'  => round($row?->borxh  ?? 0, 2),
                'count'  => (int) ($row?->count ?? 0),
            ];
        })->values();

        // ── Clients by type ──────────────────────────────────────────────────
        $byType = Client::selectRaw('lloji_klientit, COUNT(*) as total')
                        ->groupBy('lloji_klientit')
                        ->get()
                        ->map(fn($r) => ['lloji' => $r->lloji_klientit, 'total' => $r->total]);

        // ── New clients last 6 months ────────────────────────────────────────
        $newClientsRows = Client::selectRaw('YEAR(data_regjistrimit) as yr, MONTH(data_regjistrimit) as mn, COUNT(*) as total')
            ->whereRaw('data_regjistrimit >= ?', [$now->copy()->subMonths(5)->startOfMonth()])
            ->groupByRaw('YEAR(data_regjistrimit), MONTH(data_regjistrimit)')
            ->get()
            ->keyBy(fn($r) => "{$r->yr}-{$r->mn}");

        $newClients = $months->map(function ($m) use ($newClientsRows) {
            $key = "{$m['year']}-{$m['month']}";
            return [
                'label' => $m['label'],
                'total' => (int) ($newClientsRows[$key]?->total ?? 0),
            ];
        })->values();

        // ── Recent activity ──────────────────────────────────────────────────
        $recentFaturat = Fature::with('kontrate.klient')
            ->orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($f) => [
                'type'    => 'fature',
                'icon'    => 'invoice',
                'text'    => "Faturë {$f->periudha} — " . ($f->kontrate?->klient?->emri . ' ' . $f->kontrate?->klient?->mbiemri),
                'sub'     => number_format($f->totali, 2) . '€ · ' . $f->statusi,
                'statusi' => $f->statusi,
                'date'    => $f->created_at,
            ]);

        $recentKlientet = Client::orderBy('created_at', 'desc')
            ->limit(5)
            ->get()
            ->map(fn($c) => [
                'type'    => 'klient',
                'icon'    => 'person',
                'text'    => "Klient i ri — {$c->emri} {$c->mbiemri}",
                'sub'     => $c->lloji_klientit . ' · ' . $c->email,
                'statusi' => $c->statusi,
                'date'    => $c->created_at,
            ]);

        $activity = $recentFaturat->concat($recentKlientet)
            ->sortByDesc('date')
            ->take(8)
            ->values();

        return response()->json([
            'kpis' => [
                'total_klientet' => $totalKlientet,
                'klientet_aktiv' => $klientetAktiv,
                'faturat_muajit' => $faturatMuajit,
                'borxhi_total'   => round($borxhiTotal, 2),
                'numrat_aktiv'   => $numratAktiv,
            ],
            'revenue'     => $revenue,
            'new_clients' => $newClients,
            'by_type'     => $byType,
            'activity'    => $activity,
        ]);
    }
}
