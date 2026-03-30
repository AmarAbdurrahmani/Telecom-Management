<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        // ── Admin user ────────────────────────────────────────────────────────
        DB::table('users')->updateOrInsert(
            ['email' => 'arberkrasniqi@gmail.com'],
            [
                'name'       => 'Arber Krasniqi',
                'password'   => Hash::make('arber123'),
                'roli'       => 'admin',
                'aktiv'      => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        // ── Team Lead ─────────────────────────────────────────────────────────
        DB::table('users')->updateOrInsert(
            ['email' => 'fjolla@telecom.al'],
            [
                'name'       => 'Fjolla Berisha',
                'password'   => Hash::make('fjolla123'),
                'roli'       => 'tl',
                'aktiv'      => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        // ── Agent ─────────────────────────────────────────────────────────────
        DB::table('users')->updateOrInsert(
            ['email' => 'bujar@telecom.al'],
            [
                'name'       => 'Bujar Morina',
                'password'   => Hash::make('bujar123'),
                'roli'       => 'agent',
                'aktiv'      => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );

        // ── Klient user (portal access) ───────────────────────────────────────
        DB::table('users')->updateOrInsert(
            ['email' => 'amar@portal.al'],
            [
                'name'       => 'Amar Abdurrahmani',
                'password'   => Hash::make('amar123'),
                'roli'       => 'klient',
                'aktiv'      => true,
                'updated_at' => now(),
                'created_at' => now(),
            ]
        );
        $klientUserId = DB::table('users')->where('email', 'amar@portal.al')->value('id');

        // ── Skip rest if demo data already exists ─────────────────────────────
        if (DB::table('kontratat')->where('numri_kontrates', 'KNT-2024-001')->exists()) {
            $this->command->info('Demo data already seeded. Only passwords were updated.');
            return;
        }

        // ── Paketa ────────────────────────────────────────────────────────────
        $paket1 = DB::table('paketat')->insertGetId([
            'emri_paketes'     => 'Basic 50MB',
            'pershkrimi'       => 'Paketë bazë interneti',
            'cmimi_mujor'      => 9.99,
            'lloji_sherbimit'  => 'internet',
            'shpejtesia_mb'    => 50,
            'minuta'           => 0,
            'sms'              => 0,
            'data_gb'          => 20,
            'aktive'           => true,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $paket2 = DB::table('paketat')->insertGetId([
            'emri_paketes'     => 'Combo 200MB',
            'pershkrimi'       => 'Internet + Telefoni + TV',
            'cmimi_mujor'      => 24.99,
            'lloji_sherbimit'  => 'combo',
            'shpejtesia_mb'    => 200,
            'minuta'           => 300,
            'sms'              => 100,
            'data_gb'          => 50,
            'aktive'           => true,
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // ── Klientët ─────────────────────────────────────────────────────────
        $klient1 = DB::table('clients')->insertGetId([
            'user_id'          => $klientUserId,
            'emri'             => 'Amar',
            'mbiemri'          => 'Abdurrahmani',
            'numri_personal'   => '1234567890',
            'email'            => 'amar@portal.al',
            'telefoni'         => '044111222',
            'adresa'           => 'Rr. Dëshmorët, Prishtinë',
            'lloji_klientit'   => 'individual',
            'statusi'          => 'aktiv',
            'data_regjistrimit'=> now()->subMonths(6),
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $klient2 = DB::table('clients')->insertGetId([
            'user_id'          => null,
            'emri'             => 'Liridon',
            'mbiemri'          => 'Gashi',
            'numri_personal'   => '9876543210',
            'email'            => 'liridon@gmail.com',
            'telefoni'         => '049333444',
            'adresa'           => 'Rr. UÇK, Prizren',
            'lloji_klientit'   => 'biznes',
            'statusi'          => 'aktiv',
            'data_regjistrimit'=> now()->subMonths(3),
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // ── Kontratat ─────────────────────────────────────────────────────────
        $kontrate1 = DB::table('kontratat')->insertGetId([
            'numri_kontrates'  => 'KNT-2024-001',
            'klient_id'        => $klient1,
            'paket_id'         => $paket2,
            'data_fillimit'    => now()->subMonths(6),
            'data_mbarimit'    => now()->addMonths(6),
            'statusi'          => 'aktive',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        $kontrate2 = DB::table('kontratat')->insertGetId([
            'numri_kontrates'  => 'KNT-2024-002',
            'klient_id'        => $klient2,
            'paket_id'         => $paket1,
            'data_fillimit'    => now()->subMonths(3),
            'data_mbarimit'    => now()->addMonths(9),
            'statusi'          => 'aktive',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // ── Numrat telefonit ─────────────────────────────────────────────────
        DB::table('numrat_telefonit')->insert([
            'kontrate_id'      => $kontrate1,
            'numri_telefonit'  => '+38344100200',
            'statusi'          => 'aktiv',
            'data_aktivizimit' => now()->subMonths(6),
            'lloji'            => 'postpaid',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        DB::table('numrat_telefonit')->insert([
            'kontrate_id'      => $kontrate2,
            'numri_telefonit'  => '+38349200300',
            'statusi'          => 'aktiv',
            'data_aktivizimit' => now()->subMonths(3),
            'lloji'            => 'prepaid',
            'created_at'       => now(),
            'updated_at'       => now(),
        ]);

        // ── Faturat ──────────────────────────────────────────────────────────
        // Amar — 3 months of invoices (2 paid, 1 unpaid)
        DB::table('faturat')->insert([
            'kontrate_id'   => $kontrate1,
            'periudha'      => 'Janar 2026',
            'shuma_baze'    => 24.99,
            'shuma_shtese'  => 0,
            'tatimi'        => 4.50,
            'totali'        => 29.49,
            'data_leshimit' => '2026-01-05',
            'data_pageses'  => '2026-01-15',
            'statusi'       => 'e_paguar',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        DB::table('faturat')->insert([
            'kontrate_id'   => $kontrate1,
            'periudha'      => 'Shkurt 2026',
            'shuma_baze'    => 24.99,
            'shuma_shtese'  => 0,
            'tatimi'        => 4.50,
            'totali'        => 29.49,
            'data_leshimit' => '2026-02-05',
            'data_pageses'  => '2026-02-18',
            'statusi'       => 'e_paguar',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        DB::table('faturat')->insert([
            'kontrate_id'   => $kontrate1,
            'periudha'      => 'Mars 2026',
            'shuma_baze'    => 24.99,
            'shuma_shtese'  => 5.00,
            'tatimi'        => 5.40,
            'totali'        => 35.39,
            'data_leshimit' => '2026-03-05',
            'data_pageses'  => null,
            'statusi'       => 'e_papaguar',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        // Liridon — 1 overdue invoice
        DB::table('faturat')->insert([
            'kontrate_id'   => $kontrate2,
            'periudha'      => 'Mars 2026',
            'shuma_baze'    => 9.99,
            'shuma_shtese'  => 0,
            'tatimi'        => 1.80,
            'totali'        => 11.79,
            'data_leshimit' => '2026-03-05',
            'data_pageses'  => null,
            'statusi'       => 'e_vonuar',
            'created_at'    => now(),
            'updated_at'    => now(),
        ]);

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('Admin:  arberkrasniqi@gmail.com / arber123');
        $this->command->info('Klient: amar@portal.al / amar123');
    }
}
