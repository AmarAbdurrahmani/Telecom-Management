<?php

namespace Database\Seeders;

use App\Models\Antenna;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class AntennaSeeder extends Seeder
{
    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('tasks')->truncate();
        DB::table('antennas')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        $techId    = User::where('pozita', 'like', '%Technician%')->value('id')
                  ?? User::where('roli', 'admin')->value('id');
        $engineerId = User::where('pozita', 'like', '%Field Engineer%')->first()?->id
                  ?? $techId;

        // ── FULL LIST: 105 antennas across Kosovo neighborhoods ──────────────
        // Format: [name, lat, lon, type, status, radius_m, city]
        $antennas = [

            // ─── PRISHTINË — 42 points ──────────────────────────────────────
            ['Taukbahçe 5G',               42.6620, 21.1530, '5G',  'active',      700, 'Prishtinë'],
            ['Muhaxhert LTE',              42.6710, 21.1450, 'LTE', 'maintenance', 1800, 'Prishtinë'],
            ['Arbëria 5G',                 42.6490, 21.1750, '5G',  'active',      750, 'Prishtinë'],
            ['Dardania 5G',                42.6580, 21.1480, '5G',  'active',      700, 'Prishtinë'],
            ['Bregu i Diellit 5G',         42.6700, 21.1850, '5G',  'active',      800, 'Prishtinë'],
            ['Ulpiana 5G',                 42.6560, 21.1700, '5G',  'active',      750, 'Prishtinë'],
            ['Qendër Prishtinë 5G',        42.6629, 21.1655, '5G',  'active',      800, 'Prishtinë'],
            ['Pejton 5G',                  42.6610, 21.1610, '5G',  'active',      700, 'Prishtinë'],
            ['Dragodan 5G',                42.6550, 21.1750, '5G',  'active',      700, 'Prishtinë'],
            ['Mati 2 5G',                  42.6500, 21.1450, '5G',  'active',      650, 'Prishtinë'],
            ['Bulevardi Teresa 5G',        42.6605, 21.1620, '5G',  'active',      800, 'Prishtinë'],
            ['Blloku i Ri 5G',             42.6540, 21.1630, '5G',  'active',      700, 'Prishtinë'],
            ['Shatërvani 5G',              42.6615, 21.1660, '5G',  'active',      750, 'Prishtinë'],
            ['Sunny Hill 5G',              42.6720, 21.1780, '5G',  'active',      700, 'Prishtinë'],
            ['Aktash 5G',                  42.6730, 21.1600, '5G',  'active',      650, 'Prishtinë'],
            ['Lakrishte LTE',              42.6380, 21.1600, 'LTE', 'active',      2000, 'Prishtinë'],
            ['Kalabria LTE',               42.6750, 21.1400, 'LTE', 'active',      2200, 'Prishtinë'],
            ['Veternik LTE',               42.6800, 21.1100, 'LTE', 'active',      2500, 'Prishtinë'],
            ['Mati 1 LTE',                 42.6450, 21.1600, 'LTE', 'active',      1800, 'Prishtinë'],
            ['Kodra e Diellit LTE',        42.6520, 21.1820, 'LTE', 'active',      2000, 'Prishtinë'],
            ['Hajvali LTE',                42.6150, 21.2200, 'LTE', 'active',      2500, 'Prishtinë'],
            ['Graçanicë LTE',              42.6013, 21.1954, 'LTE', 'active',      2200, 'Prishtinë'],
            ['Çagllavicë LTE',             42.6200, 21.2000, 'LTE', 'active',      2000, 'Prishtinë'],
            ['Germia LTE',                 42.6780, 21.2100, 'LTE', 'active',      2800, 'Prishtinë'],
            ['Kurrizi LTE',                42.6600, 21.1900, 'LTE', 'active',      1800, 'Prishtinë'],
            ['Velania LTE',                42.6480, 21.1900, 'LTE', 'active',      1900, 'Prishtinë'],
            ['Dodona LTE',                 42.6650, 21.1730, 'LTE', 'active',      2000, 'Prishtinë'],
            ['Tophane LTE',                42.6580, 21.1600, 'LTE', 'active',      1700, 'Prishtinë'],
            ['Sanitat LTE',                42.6660, 21.1560, 'LTE', 'active',      1600, 'Prishtinë'],
            ['Ramiz Sadiku LTE',           42.6500, 21.1700, 'LTE', 'active',      1800, 'Prishtinë'],
            ['Avni Rrustemi LTE',          42.6620, 21.1680, 'LTE', 'active',      1500, 'Prishtinë'],
            ['28 Nëntori LTE',             42.6620, 21.1520, 'LTE', 'active',      1600, 'Prishtinë'],
            ['Besa LTE',                   42.6430, 21.1550, 'LTE', 'active',      2000, 'Prishtinë'],
            ['Dëshmorët LTE',              42.6520, 21.1480, 'LTE', 'active',      1800, 'Prishtinë'],
            ['Taslixhe LTE',               42.6640, 21.1420, 'LTE', 'active',      2000, 'Prishtinë'],
            ['Kodër Trimave LTE',          42.6400, 21.1700, 'LTE', 'active',      2200, 'Prishtinë'],
            ['Kishnica LTE',               42.6050, 21.2500, 'LTE', 'active',      3000, 'Prishtinë'],
            ['Lagja e Spitalit LTE',       42.6680, 21.1440, 'LTE', 'maintenance', 1500, 'Prishtinë'],
            ['Fushë Kosovë 5G',            42.6381, 21.0992, '5G',  'active',      700, 'Fushë Kosovë'],
            ['Fushë Kosovë LTE',           42.6300, 21.0900, 'LTE', 'active',      2500, 'Fushë Kosovë'],
            ['Millosh Giliq LTE',          42.6420, 21.0800, 'LTE', 'active',      2200, 'Fushë Kosovë'],
            ['Mazgit LTE',                 42.6480, 21.1050, 'LTE', 'active',      2000, 'Prishtinë'],

            // ─── MITROVICË — 12 points ──────────────────────────────────────
            ['Isa Boletini LTE',           42.8950, 20.8700, 'LTE', 'active',      2000, 'Mitrovicë'],
            ['Qendër Mitrovicë 5G',        42.8914, 20.8660, '5G',  'active',      700, 'Mitrovicë'],
            ['Suhodoll LTE',               42.8800, 20.8500, 'LTE', 'active',      2500, 'Mitrovicë'],
            ['Bostan LTE',                 42.8870, 20.8620, 'LTE', 'active',      2000, 'Mitrovicë'],
            ['Trepça LTE',                 42.9050, 20.8750, 'LTE', 'maintenance', 2800, 'Mitrovicë'],
            ['Lagja e Re Mitrovicë LTE',   42.8980, 20.8580, 'LTE', 'active',      1800, 'Mitrovicë'],
            ['Kodra Mitrovicë LTE',        42.9020, 20.8700, 'LTE', 'active',      2200, 'Mitrovicë'],
            ['Zhabar LTE',                 42.9100, 20.9200, 'LTE', 'active',      3000, 'Mitrovicë'],
            ['Bajgora LTE',                42.9200, 20.9000, 'LTE', 'active',      3500, 'Mitrovicë'],
            ['Vushtrri Qendër 5G',         42.8227, 20.9674, '5G',  'active',      600, 'Vushtrri'],
            ['Vushtrri Lagja LTE',         42.8100, 20.9500, 'LTE', 'active',      2500, 'Vushtrri'],
            ['Skenderaj 5G',               42.7468, 20.7893, '5G',  'active',      600, 'Skenderaj'],

            // ─── PRIZREN — 10 points ────────────────────────────────────────
            ['Qendër Prizren 5G',          42.2139, 20.7397, '5G',  'active',      800, 'Prizren'],
            ['Nënkala 5G',                 42.2100, 20.7300, '5G',  'active',      700, 'Prizren'],
            ['Gërmia Prizren 5G',          42.2250, 20.7500, '5G',  'active',      650, 'Prizren'],
            ['Sheshgjethe LTE',            42.2180, 20.7450, 'LTE', 'active',      2000, 'Prizren'],
            ['Terzi Mahalle LTE',          42.2080, 20.7350, 'LTE', 'active',      1800, 'Prizren'],
            ['Vranishtë LTE',              42.2300, 20.7250, 'LTE', 'active',      2500, 'Prizren'],
            ['Mushtishtë LTE',             42.3000, 20.6900, 'LTE', 'active',      3000, 'Prizren'],
            ['Hoçë e Madhe LTE',           42.3300, 20.7100, 'LTE', 'active',      3500, 'Prizren'],
            ['Landovicë LTE',              42.1900, 20.7600, 'LTE', 'active',      2800, 'Prizren'],
            ['Zhur LTE',                   42.1700, 20.7000, 'LTE', 'active',      3000, 'Prizren'],

            // ─── GJILAN — 8 points ───────────────────────────────────────────
            ['Qendër Gjilan 5G',           42.4635, 21.4694, '5G',  'active',      750, 'Gjilan'],
            ['Liria Gjilan 5G',            42.4700, 21.4800, '5G',  'active',      700, 'Gjilan'],
            ['Bujan LTE',                  42.4550, 21.4750, 'LTE', 'active',      2000, 'Gjilan'],
            ['Gjinoci LTE',                42.4500, 21.4600, 'LTE', 'active',      2200, 'Gjilan'],
            ['Velekincë LTE',              42.4800, 21.4900, 'LTE', 'active',      2500, 'Gjilan'],
            ['Ranilug LTE',                42.5100, 21.5500, 'LTE', 'active',      3500, 'Gjilan'],
            ['Kllokot LTE',                42.3800, 21.4200, 'LTE', 'active',      3000, 'Gjilan'],
            ['Viti LTE',                   42.3200, 21.3600, 'LTE', 'active',      3000, 'Gjilan'],

            // ─── PEJË — 8 points ─────────────────────────────────────────────
            ['Qendër Pejë 5G',             42.6596, 20.2886, '5G',  'active',      700, 'Pejë'],
            ['Lagja Trim Pejë 5G',         42.6650, 20.2950, '5G',  'active',      650, 'Pejë'],
            ['Rogovë LTE',                 42.6700, 20.2750, 'LTE', 'active',      2500, 'Pejë'],
            ['Strellc LTE',                42.6450, 20.3100, 'LTE', 'active',      3000, 'Pejë'],
            ['Lugbunë LTE',                42.6780, 20.3000, 'LTE', 'active',      2800, 'Pejë'],
            ['Istog Qendër LTE',           42.7831, 20.4868, 'LTE', 'active',      3000, 'Istog'],
            ['Klina LTE',                  42.6234, 20.5747, 'LTE', 'active',      3500, 'Klina'],
            ['Deçan LTE',                  42.5393, 20.2891, 'LTE', 'active',      3000, 'Deçan'],

            // ─── FERIZAJ — 7 points ──────────────────────────────────────────
            ['Qendër Ferizaj 5G',          42.3700, 21.1483, '5G',  'active',      700, 'Ferizaj'],
            ['Lagja e Re Ferizaj 5G',      42.3750, 21.1550, '5G',  'active',      650, 'Ferizaj'],
            ['Nerodime LTE',               42.3900, 21.1600, 'LTE', 'active',      2800, 'Ferizaj'],
            ['Sojeva LTE',                 42.3500, 21.1200, 'LTE', 'active',      2500, 'Ferizaj'],
            ['Babush i Poshtëm LTE',       42.3600, 21.1800, 'LTE', 'active',      2800, 'Ferizaj'],
            ['Kaçanik LTE',                42.2328, 21.2569, 'LTE', 'active',      3000, 'Kaçanik'],
            ['Hani i Elezit LTE',          42.1500, 21.2900, 'LTE', 'active',      3500, 'Hani i Elezit'],

            // ─── GJAKOVË — 6 points ──────────────────────────────────────────
            ['Qendër Gjakovë 5G',          42.3872, 20.4286, '5G',  'active',      700, 'Gjakovë'],
            ['Çabrati 5G',                 42.3800, 20.4150, '5G',  'active',      650, 'Gjakovë'],
            ['Pastasel LTE',               42.4000, 20.4400, 'LTE', 'active',      2500, 'Gjakovë'],
            ['Gjakovë Veri LTE',           42.4100, 20.4300, 'LTE', 'active',      2800, 'Gjakovë'],
            ['Dobrosh LTE',                42.3700, 20.4100, 'LTE', 'active',      3000, 'Gjakovë'],
            ['Ratkoc LTE',                 42.3500, 20.3900, 'LTE', 'maintenance', 2500, 'Gjakovë'],

            // ─── OTHER MUNICIPALITIES ────────────────────────────────────────
            ['Lipjan Qendër 5G',           42.5221, 21.1243, '5G',  'active',      600, 'Lipjan'],
            ['Lipjan Veri LTE',            42.5350, 21.1100, 'LTE', 'active',      2500, 'Lipjan'],
            ['Podujeva Qendër 5G',         42.9111, 21.1942, '5G',  'active',      650, 'Podujeva'],
            ['Llaptë LTE',                 42.8900, 21.2100, 'LTE', 'active',      3000, 'Podujeva'],
            ['Rahovec Qendër LTE',         42.3985, 20.6549, 'LTE', 'active',      3000, 'Rahovec'],
            ['Suhareka Qendër LTE',        42.3600, 20.8259, 'LTE', 'active',      3000, 'Suhareka'],
            ['Malishevë Qendër LTE',       42.4850, 20.7450, 'LTE', 'active',      3200, 'Malishevë'],
            ['Kamenicë Qendër LTE',        42.5833, 21.5833, 'LTE', 'active',      3500, 'Kamenicë'],
            ['Dragash Qendër LTE',         42.0600, 20.6500, 'LTE', 'active',      3500, 'Dragash'],
            ['Novobërdë LTE',              42.6013, 21.4319, 'LTE', 'active',      4000, 'Novobërdë'],
            ['Shtërpcë LTE',               42.2400, 21.0200, 'LTE', 'active',      3500, 'Shtërpcë'],
            ['Partesh LTE',                42.3700, 21.4200, 'LTE', 'active',      4000, 'Partesh'],
        ];

        foreach ($antennas as $a) {
            Antenna::create([
                'emri'              => $a[0],
                'lat'               => $a[1],
                'lon'               => $a[2],
                'tipi'              => $a[3],
                'statusi'           => $a[4],
                'coverage_radius_m' => $a[5],
                'qyteti'            => $a[6],
                'installed_by'      => $a[3] === '5G' ? $techId : $engineerId,
                'shenimet'          => $a[4] === 'maintenance'
                    ? 'Kërkon mirëmbajtje — ekipi teknik është njoftuar.'
                    : null,
            ]);
        }

        $total = count($antennas);
        $g5    = collect($antennas)->where(3, '5G')->count();
        $lte   = collect($antennas)->where(3, 'LTE')->count();
        $this->command->info("✅ Antenat: {$total} total ({$g5} × 5G, {$lte} × LTE)");
    }
}