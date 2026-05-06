<?php

namespace Database\Seeders;

use App\Models\Infrastruktura;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class InfrastrukturaSeeder extends Seeder
{
    public function run(): void
    {
        DB::table('infrastruktura')->truncate();

        $records = [
            // Core Network
            ['server',  'Data Center Prishtinë – Ndërtesa IBN', '10 Gbps backbone',   'aktive',         '2024-03-15', '2026-03-01', 'Serveri kryesor i rrjetit. Rack 42U, redundancë UPS dhe gjenerat. Monitorim 24/7.'],
            ['server',  'Data Center Backup – Fushë Kosovë',    '10 Gbps failover',    'aktive',         '2024-06-01', '2025-12-10', 'Serveri rezervë. Failover automatik brenda 30 sekondave. SLA 99.99%.'],
            ['firewall','Firewall Kryesor – DC Prishtinë',       'Fortinet 200F',       'aktive',         '2024-03-15', '2026-02-15', 'Firewall enterprise me IPS/IDS aktiv. Ruleset i përditësuar çdo javë.'],
            ['switch',  'Core Switch – DC Prishtinë',            '48-port 10G SFP+',   'aktive',         '2024-03-15', '2026-01-20', 'Cisco Catalyst 9500. VLAN segregation aktive. Spanning Tree konfiguruar.'],
            ['router',  'BGP Router – Lidhja Ndërkombëtare',    'Cisco ASR 1001-X',    'aktive',         '2024-04-01', '2026-03-05', 'BGP peering me 3 ISP ndërkombëtarë. Redundancë e plotë. Latencë < 5ms deri Vjenë.'],

            // Fiber Optic
            ['kabllo',  'Fibër Optike – Prishtinë Ring',         '96-core SM G.652D',  'aktive',         '2023-09-01', '2025-11-15', 'Unaza kryesore e fibrit nëpër Prishtinë. Gjatësi 45 km. Monitorim OTDR çdo 3 muaj.'],
            ['kabllo',  'Fibër Optike – Prishtinë–Prizren',      '48-core SM G.652D',  'aktive',         '2023-11-15', '2025-10-20', 'Lidhja backbone Prishtinë–Prizren 85 km. Amplifikatorë çdo 25 km.'],
            ['kabllo',  'Fibër Optike – Prishtinë–Ferizaj',      '48-core SM',         'aktive',         '2024-01-10', '2026-01-10', 'Backbone vertikal. 42 km. Monitorim automatik me alarme SMS.'],
            ['kabllo',  'Fibër Optike – Prishtinë–Gjilan',       '24-core SM',         'aktive',         '2024-02-20', '2025-09-05', 'Lidhja lindore 65 km.'],
            ['kabllo',  'Fibër Optike – Prishtinë–Pejë',         '48-core SM',         'ne_mirembajtje', '2023-08-01', '2026-04-28', 'Mirëmbajtje aktive — seksioni km 34 dëmtuar nga punët rrugore. ETA rikthim: 3 ditë.'],
            ['kabllo',  'Kabllo Nëntokësor – Ura e Fushës',      '12-core SM',         'defekt',         '2022-06-15', '2024-08-10', 'Kabllo e dëmtuar nga përmbytja. Zëvendësim planifikuar Q2 2026.'],

            // Access Network
            ['olt',     'OLT Prishtinë Qendër',                  '512 port GPON',      'aktive',         '2024-01-15', '2026-02-01', 'Huawei MA5800-X17. Shërben 512 klientë FTTH në qendër. Ngarkesa aktuale 78%.'],
            ['olt',     'OLT Arbëria–Dardania',                   '256 port GPON',      'aktive',         '2024-02-28', '2026-02-28', 'ZTE ZXAN C650. 256 porte, ngarkesa 61%. Zgjerim i planifikuar Q3 2026.'],
            ['olt',     'OLT Fushë Kosovë',                       '128 port GPON',      'aktive',         '2024-05-10', '2026-03-15', 'Huawei MA5608T. 128 porte, ngarkesa 44%.'],
            ['olt',     'OLT Prizren Qendër',                     '256 port GPON',      'aktive',         '2024-03-20', '2026-01-25', 'ZTE ZXAN C300. Ngarkesa 55%. Ekspansion në Nënkala planifikuar.'],
            ['olt',     'OLT Gjilan',                              '128 port GPON',      'aktive',         '2024-06-15', '2026-02-10', 'Huawei MA5608T. Ngarkesa 38%.'],

            // Radio / Antennas Equipment
            ['antena',  'BBU 5G NR – Prishtinë Qendër',          'Huawei AAU5613',     'aktive',         '2025-01-10', '2026-04-15', 'Baseband Unit 5G NR për zonën Taukbahçe–Qendër. Power output 200W. Temperatura operative normale.'],
            ['antena',  'BBU 5G NR – Dardania',                   'Ericsson AIR 6449',  'aktive',         '2025-02-15', '2026-03-20', 'Remote Radio Unit mbi kullën 32m. Lidhja fronthaul 25G.'],
            ['antena',  'BBU 5G NR – Arbëria',                    'Nokia AirScale',     'aktive',         '2025-03-01', '2026-04-01', 'Antena aktive 64T64R. Massive MIMO aktiv. Kapacitet 2.1 Gbps teorik.'],
            ['antena',  'Antena LTE Muhaxhert',                   'Huawei RRU3959',     'ne_mirembajtje', '2023-04-20', '2025-06-10', 'RRU me defekt në moduli VSWR. Alarmi aktiv. Ekipi i terrenin është njoftuar për zëvendësim.'],
            ['antena',  'Antena LTE Isa Boletini – Mitrovicë',    'ZTE RRU',            'aktive',         '2023-11-01', '2026-01-30', 'Kulla 30m, 3 sektor LTE 1800MHz. Mbulim 2km rreze. Konfigurim standard.'],
            ['antena',  'Antena LTE Trepça – Mitrovicë',          'Huawei RRU3953',     'ne_mirembajtje', '2022-08-15', '2025-05-20', 'Dëmtim mekanik nga stuhia e marsit. Sektori veri jashtë funksionit. Prioritet i lartë riparimi.'],

            // Power
            ['tjeter',  'UPS & Gjenerat – DC Prishtinë',          '200 kVA + 250 kVA',  'aktive',         '2024-03-15', '2026-03-10', 'APC Symmetra LX 200kVA UPS + gjenerat diesel 250kVA. Autonomi 8 orë. Testim mujor i rregullt.'],
            ['tjeter',  'Sistem Ftohje – DC Prishtinë',            'Precision AC 60kW',  'aktive',         '2024-03-15', '2026-01-15', 'Emerson Liebert PEX 60kW. Temperatura salla: 21°C. Alarm konfiguruar mbi 26°C.'],
            ['tjeter',  'UPS Site Prizren',                        '20 kVA',             'aktive',         '2024-04-01', '2026-02-20', 'Eaton 9355 UPS. Autonomi 4 orë. Mirëmbajtje e fundit OK.'],
        ];

        foreach ($records as $r) {
            Infrastruktura::create([
                'lloji'                       => $r[0],
                'lokacioni'                   => $r[1],
                'kapaciteti'                  => $r[2],
                'statusi'                     => $r[3],
                'data_instalimit'             => $r[4],
                'data_mirembajtjes_fundit'    => $r[5],
                'pershkrimi'                  => $r[6],
            ]);
        }

        $this->command->info('✅ Infrastruktura: ' . count($records) . ' rekorde u shtuan.');
    }
}