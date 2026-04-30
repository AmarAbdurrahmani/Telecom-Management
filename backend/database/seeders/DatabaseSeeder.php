<?php
namespace Database\Seeders;

use App\Models\User;
use App\Models\Client;
use App\Models\Paket;
use App\Models\Kontrate;
use App\Models\Fature;
use App\Models\NumriTelefonit;
use App\Models\Antenna;
use App\Models\SimKartela;
use App\Models\Pajisje;
use App\Models\ChatMessage;
use App\Models\Task;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    // Albanian male first names
    private array $emrat_m = [
        'Arben','Agron','Besnik','Burim','Driton','Durim','Erion','Fatos','Fitim','Gezim',
        'Gjergj','Ismet','Jetmir','Kadri','Kujtim','Liridon','Muhamet','Naim','Nexhmedin',
        'Petrit','Ramadan','Rexhep','Rinor','Shqiprim','Sokol','Taulant','Trim','Valdrin',
        'Valmir','Valon','Veton','Visar','Xhavit','Yllzon','Alban','Arlind','Blerand',
        'Dafin','Edon','Flamur','Granit','Hekuran','Ilir','Jeton','Kreshnik','Labinot',
        'Mentor','Njomez','Orgest','Pranver','Qendrim','Ridvan','Sajmir','Uran',
        'Yll','Zymer','Adnan','Bleron','Cen','Dren','Edmond','Faik',
    ];

    // Albanian female first names
    private array $emrat_f = [
        'Adelina','Aferdita','Agime','Arta','Besnike','Drita','Elvira','Fatmire','Flaka',
        'Flora','Ganimete','Hatixhe','Ilire','Lumturi','Mimoza','Nora','Pranvera','Qendresa',
        'Rebeka','Rita','Rozafa','Safete','Shqipe','Teuta','Valdete','Veprore','Vlora',
        'Arjeta','Blerina','Donika','Edona','Fjolla','Genta','Hana','Ina','Jeta','Kaltrina',
        'Lena','Mrika','Njomeza','Orinda','Paola','Rina','Sara','Tina','Una','Vesa','Zana',
        'Alida','Besiana','Darla','Elona','Fatmira','Gresa','Herolinda',
    ];

    // Albanian last names
    private array $mbiemrat = [
        'Ahmeti','Aliu','Bajrami','Berisha','Bytyqi','Demolli','Gashi','Hajdari',
        'Hoxha','Islami','Jakupi','Jashari','Kastrati','Kelmendi','Krasniqi','Limani',
        'Luma','Mustafa','Osmani','Pllana','Rama','Rexha','Sahiti','Salihu','Sela',
        'Shala','Shehu','Thaci','Ukaj','Veseli','Vokshi','Xhemajli','Zymberi',
        'Kryeziu','Bislimi','Fetahu','Halimi','Idrizi','Jaha','Kopaci',
        'Latifi','Maloku','Nuha','Palushi','Qosja','Rushiti','Stavileci','Ternava',
        'Ujkani','Vullnetari','Ymeri','Zeneli','Abdullahu','Behluli',
    ];

    // Kosovo cities with approximate coordinates
    private array $qytetet = [
        ['Prishtine', 42.6629, 21.1655],
        ['Prizren', 42.2139, 20.7397],
        ['Ferizaj', 42.3700, 21.1483],
        ['Gjilan', 42.4635, 21.4694],
        ['Peje', 42.6596, 20.2886],
        ['Mitrovice', 42.8914, 20.8660],
        ['Gjakove', 42.3872, 20.4286],
        ['Vushtrri', 42.8227, 20.9674],
        ['Lipjan', 42.5221, 21.1243],
        ['Podujeva', 42.9111, 21.1942],
        ['Suhareka', 42.3600, 20.8259],
        ['Rahovec', 42.3985, 20.6549],
        ['Fushe Kosove', 42.6381, 21.0992],
        ['Kacanik', 42.2328, 21.2569],
        ['Malisheve', 42.4850, 20.7450],
        ['Skenderaj', 42.7468, 20.7893],
        ['Istog', 42.7831, 20.4868],
        ['Kamenice', 42.5833, 21.5833],
        ['Dragash', 42.0600, 20.6500],
        ['Vitia', 42.3200, 21.3600],
    ];

    // 23 5G NR antennas in Kosovo
    private array $antenat_5g = [
        ['Prishtine Qender 5G', 42.6629, 21.1655, 'Prishtine', 800],
        ['Prishtine Arberia 5G', 42.6490, 21.1750, 'Prishtine', 750],
        ['Prishtine Dardania 5G', 42.6580, 21.1480, 'Prishtine', 700],
        ['Prishtine Bregu i Diellit 5G', 42.6700, 21.1850, 'Prishtine', 800],
        ['Prishtine Fushe Kosove 5G', 42.6381, 21.0992, 'Fushe Kosove', 600],
        ['Prishtine Ulpiana 5G', 42.6560, 21.1700, 'Prishtine', 700],
        ['Prizren Qender 5G', 42.2139, 20.7397, 'Prizren', 800],
        ['Prizren Germia 5G', 42.2250, 20.7500, 'Prizren', 600],
        ['Ferizaj Qender 5G', 42.3700, 21.1483, 'Ferizaj', 700],
        ['Gjilan Qender 5G', 42.4635, 21.4694, 'Gjilan', 750],
        ['Peje Qender 5G', 42.6596, 20.2886, 'Peje', 700],
        ['Mitrovice Jugore 5G', 42.8914, 20.8660, 'Mitrovice', 700],
        ['Gjakove Qender 5G', 42.3872, 20.4286, 'Gjakove', 700],
        ['Vushtrri Qender 5G', 42.8227, 20.9674, 'Vushtrri', 600],
        ['Lipjan Qender 5G', 42.5221, 21.1243, 'Lipjan', 600],
        ['Podujeva Qender 5G', 42.9111, 21.1942, 'Podujeva', 650],
        ['Suhareka Qender 5G', 42.3600, 20.8259, 'Suhareka', 600],
        ['Rahovec Qender 5G', 42.3985, 20.6549, 'Rahovec', 600],
        ['Skenderaj Qender 5G', 42.7468, 20.7893, 'Skenderaj', 550],
        ['Kamenice Qender 5G', 42.5833, 21.5833, 'Kamenice', 600],
        ['Kacanik Qender 5G', 42.2328, 21.2569, 'Kacanik', 600],
        ['Malisheve Qender 5G', 42.4850, 20.7450, 'Malisheve', 600],
        ['Istog Qender 5G', 42.7831, 20.4868, 'Istog', 550],
    ];

    public function run(): void
    {
        DB::statement('SET FOREIGN_KEY_CHECKS=0;');
        DB::table('chat_messages')->truncate();
        DB::table('tasks')->truncate();
        DB::table('antennas')->truncate();
        DB::table('pagesat')->truncate();
        DB::table('faturat')->truncate();
        DB::table('numrat_telefonit')->truncate();
        DB::table('sim_kartela')->truncate();
        DB::table('kontrate_sherbime')->truncate();
        DB::table('kontratat')->truncate();
        DB::table('client_history')->truncate();
        DB::table('ankesat')->truncate();
        DB::table('clients')->truncate();
        DB::table('personal_access_tokens')->truncate();
        DB::table('users')->truncate();
        DB::statement('SET FOREIGN_KEY_CHECKS=1;');

        // ── Staff users ───────────────────────────────────────────────────────
        $admin = User::create([
            'name'         => 'Amar Abdurrahmani',
            'email'        => 'admin@telekomyt.com',
            'password'     => Hash::make('admin123'),
            'roli'         => 'admin',
            'aktiv'        => true,
            'departamenti' => 'Menaxhim',
            'pozita'       => 'CEO & Admin',
        ]);

        $staffUsers = [];
        $staffData = [
            ['Erion Krasniqi',  'erion@telekomyt.com',   'tl',    'Team Lead',      'Shitje'],
            ['Fatos Berisha',   'fatos@telekomyt.com',   'sv',    'Supervisor',     'Teknik'],
            ['Arlind Bajrami',  'arlind@telekomyt.com',  'agent', 'Sales Agent',    'Shitje'],
            ['Drita Gashi',     'drita@telekomyt.com',   'agent', 'Sales Agent',    'Shitje'],
            ['Trim Hoxha',      'trim@telekomyt.com',    'agent', 'Field Engineer', 'Teknik'],
            ['Blerina Osmani',  'blerina@telekomyt.com', 'agent', 'Technician',     'Teknik'],
            ['Visar Demolli',   'visar@telekomyt.com',   'agent', 'Field Engineer', 'Teknik'],
            ['Lumturi Salihu',  'lumturi@telekomyt.com', 'agent', 'Sales Agent',    'Shitje'],
        ];

        foreach ($staffData as $sd) {
            $staffUsers[] = User::create([
                'name'         => $sd[0],
                'email'        => $sd[1],
                'password'     => Hash::make('password123'),
                'roli'         => $sd[2],
                'aktiv'        => true,
                'pozita'       => $sd[3],
                'departamenti' => $sd[4],
            ]);
        }

        // ── Packages ──────────────────────────────────────────────────────────
        $paketatData = [
            ['Basic 4G',       '15 GB internet + 100 min',                     9.99,  'internet'],
            ['Standard 4G',    '50 GB internet + 300 min + SMS pa limit',     19.99,  'combo'],
            ['Premium 4G',     '100 GB internet + Thirrje pa limit',          29.99,  'combo'],
            ['Business Lite',  '200 GB + 5 linja + MB pa limit',              49.99,  'combo'],
            ['Business Pro',   '500 GB + 10 linja + Cloud 100GB',             89.99,  'combo'],
            ['Enterprise 5G',  '5G Unlimited + 20 linja + Cloud 1TB + SLA', 149.99,  'combo'],
            ['5G Basic',       '100 GB 5G + Thirrje pa limit',                24.99,  'internet'],
            ['5G Unlimited',   '5G pa limit + Thirrje pa limit + TV 4K',      39.99,  'combo'],
            ['VIP Gold',       '5G pa limit + Roaming EU + 3 SIM',            59.99,  'combo'],
            ['VIP Platinum',   '5G pa limit + Roaming global + 5 SIM + Priority Support', 99.99, 'combo'],
        ];

        $paketObjects = [];
        foreach ($paketatData as $p) {
            $paketObjects[] = Paket::create([
                'emri_paketes'    => $p[0],
                'pershkrimi'      => $p[1],
                'cmimi_mujor'     => $p[2],
                'lloji_sherbimit' => $p[3],
                'aktive'          => true,
            ]);
        }

        // ── Devices ───────────────────────────────────────────────────────────
        $pajisjetData = [
            ['Samsung Galaxy S24 Ultra', 'Samsung', 1299.99, 54.17, 24],
            ['Samsung Galaxy A55',       'Samsung',  449.99, 18.75, 24],
            ['iPhone 15 Pro',            'Apple',   1199.99, 49.99, 24],
            ['Honor 90',                 'Honor',    399.99, 16.67, 24],
            ['Xiaomi 14',                'Xiaomi',   899.99, 37.50, 24],
            ['Oppo Reno 11',             'Oppo',     499.99, 20.83, 24],
        ];
        $pajisjeObjects = [];
        foreach ($pajisjetData as $pj) {
            $pajisjeObjects[] = Pajisje::create([
                'emri'          => $pj[0],
                'marka'         => $pj[1],
                'cmimi_cash'    => $pj[2],
                'cmimi_keste'   => $pj[3],
                'muajt_kestes'  => $pj[4],
                'disponueshme'  => true,
            ]);
        }

        // ── 520 Clients ──────────────────────────────────────────────────────
        $clients = [];
        $llojet   = ['individual', 'individual', 'individual', 'biznes', 'vip'];
        $statuset = ['aktiv', 'aktiv', 'aktiv', 'aktiv', 'pasiv', 'pezulluar'];

        $numriPersonalBase = 1000000000;

        for ($i = 0; $i < 520; $i++) {
            $isFemale = $i % 3 === 0;
            $emri     = $isFemale
                ? $this->emrat_f[array_rand($this->emrat_f)]
                : $this->emrat_m[array_rand($this->emrat_m)];
            $mbiemri  = $this->mbiemrat[array_rand($this->mbiemrat)];
            $qyteti   = $this->qytetet[array_rand($this->qytetet)];
            $lloji    = $llojet[$i % count($llojet)];
            $statusi  = $statuset[$i % count($statuset)];

            $lat = $qyteti[1] + (mt_rand(-500, 500) / 100000);
            $lon = $qyteti[2] + (mt_rand(-500, 500) / 100000);

            $numriPersonal = (string)($numriPersonalBase + $i);
            $telefoni      = '04' . mt_rand(3, 9) . '-' . str_pad(mt_rand(0, 9999999), 7, '0', STR_PAD_LEFT);
            $email         = strtolower($emri) . '.' . strtolower($mbiemri) . $i . '@email.com';

            $user = User::create([
                'name'     => "$emri $mbiemri",
                'email'    => $email,
                'password' => Hash::make('client123'),
                'roli'     => 'klient',
                'aktiv'    => $statusi === 'aktiv',
            ]);

            $client = Client::create([
                'user_id'           => $user->id,
                'emri'              => $emri,
                'mbiemri'           => $mbiemri,
                'numri_personal'    => $numriPersonal,
                'email'             => $email,
                'telefoni'          => $telefoni,
                'adresa'            => 'Rruga ' . $qyteti[0] . ' Nr.' . mt_rand(1, 200),
                'lloji_klientit'    => $lloji,
                'statusi'           => $statusi,
                'data_regjistrimit' => now()->subDays(mt_rand(30, 730))->format('Y-m-d'),
                'latitude'          => $lat,
                'longitude'         => $lon,
                'data_faturimit'    => (mt_rand(0, 1) ? 7 : 22),
            ]);

            $clients[] = $client;
        }

        // ── Contracts + Invoices for 420 clients ─────────────────────────────
        $kontratNr = 1000;

        foreach (array_slice($clients, 0, 420) as $idx => $client) {
            if ($client->statusi === 'pezulluar' && $idx % 3 !== 0) continue;

            $paket     = $paketObjects[array_rand($paketObjects)];
            $kontratNr++;
            $numriKontrates = 'KNT-2026-' . str_pad($kontratNr, 4, '0', STR_PAD_LEFT);

            $startDate = now()->subDays(mt_rand(60, 365));
            $endDate   = $startDate->copy()->addMonths(mt_rand(12, 24));
            $statusiK  = $endDate->isPast() ? 'e_skaduar' : 'aktive';

            $pajisjeId    = null;
            $pajisjeKeste = 0;
            if ($client->lloji_klientit === 'biznes' && mt_rand(0, 1)) {
                $pj        = $pajisjeObjects[array_rand($pajisjeObjects)];
                $pajisjeId = $pj->pajisje_id;
                $pajisjeKeste = (float)$pj->cmimi_keste;
            }

            $kontrate = Kontrate::create([
                'numri_kontrates' => $numriKontrates,
                'klient_id'       => $client->klient_id,
                'paket_id'        => $paket->paket_id,
                'pajisje_id'      => $pajisjeId,
                'data_fillimit'   => $startDate->format('Y-m-d'),
                'data_mbarimit'   => $endDate->format('Y-m-d'),
                'statusi'         => $statusiK,
            ]);

            // Phone number
            $numri = NumriTelefonit::create([
                'kontrate_id'     => $kontrate->kontrate_id,
                'numri_telefonit' => '04' . mt_rand(3, 9) . str_pad(mt_rand(0, 9999999), 7, '0', STR_PAD_LEFT),
                'statusi'         => $statusiK === 'aktive' ? 'aktiv' : 'joaktiv',
                'lloji'           => 'postpaid',
            ]);

            // SIM
            SimKartela::create([
                'klient_id'    => $client->klient_id,
                'numri_id'     => $numri->numri_id,
                'nr_karteles'  => '894' . str_pad(mt_rand(0, 999999999), 10, '0', STR_PAD_LEFT),
                'tip'          => ['standard', 'micro', 'nano'][mt_rand(0, 2)],
                'statusi'      => $statusiK === 'aktive' ? 'aktive' : 'joaktive',
                'data_leshimit'=> $startDate->format('Y-m-d'),
            ]);

            // Invoices (max 6 months back)
            $months = min(6, (int)$startDate->diffInMonths(now()));
            $statusetFature = ['e_paguar', 'e_paguar', 'e_paguar', 'e_papaguar', 'e_vonuar'];

            for ($m = $months; $m >= 1; $m--) {
                $periudha  = now()->subMonths($m)->format('M Y');
                $shumaBaze = $paket->cmimi_mujor + $pajisjeKeste;
                $total     = round($shumaBaze + mt_rand(0, 200) / 100, 2);
                $st        = $m > 2 ? 'e_paguar' : $statusetFature[array_rand($statusetFature)];
                $leshuar   = now()->subMonths($m)->startOfMonth();

                Fature::create([
                    'kontrate_id'   => $kontrate->kontrate_id,
                    'periudha'      => $periudha,
                    'shuma_baze'    => round($shumaBaze, 2),
                    'shuma_shtese'  => 0,
                    'tatimi'        => 0,
                    'totali'        => $total,
                    'statusi'       => $st,
                    'data_leshimit' => $leshuar->format('Y-m-d'),
                    'data_skadimit' => $leshuar->copy()->endOfMonth()->format('Y-m-d'),
                    'data_pageses'  => $st === 'e_paguar' ? $leshuar->copy()->addDays(mt_rand(1, 15))->format('Y-m-d') : null,
                ]);
            }
        }

        // ── Antennas: 23x 5G + 85x LTE ───────────────────────────────────────
        $technicianId = $staffUsers[5]->id; // Blerina - Technician
        $engineerId   = $staffUsers[4]->id; // Trim - Field Engineer

        foreach ($this->antenat_5g as $a) {
            Antenna::create([
                'emri'              => $a[0],
                'lat'               => $a[1],
                'lon'               => $a[2],
                'qyteti'            => $a[3],
                'tipi'              => '5G',
                'statusi'           => mt_rand(0, 9) > 1 ? 'active' : 'maintenance',
                'coverage_radius_m' => $a[4],
                'installed_by'      => $technicianId,
            ]);
        }

        $lteCount = 0;
        foreach ($this->qytetet as $qyteti) {
            $nrPerCity = ($qyteti[0] === 'Prishtine') ? 16 : (
                in_array($qyteti[0], ['Prizren', 'Gjilan', 'Ferizaj', 'Peje', 'Mitrovice', 'Gjakove']) ? 6 : 3
            );
            for ($j = 0; $j < $nrPerCity && $lteCount < 85; $j++) {
                Antenna::create([
                    'emri'              => "{$qyteti[0]} LTE-" . str_pad($lteCount + 1, 3, '0', STR_PAD_LEFT),
                    'lat'               => round($qyteti[1] + mt_rand(-800, 800) / 100000, 6),
                    'lon'               => round($qyteti[2] + mt_rand(-800, 800) / 100000, 6),
                    'qyteti'            => $qyteti[0],
                    'tipi'              => 'LTE',
                    'statusi'           => mt_rand(0, 9) > 1 ? 'active' : 'maintenance',
                    'coverage_radius_m' => mt_rand(1500, 3500),
                    'installed_by'      => $engineerId,
                ]);
                $lteCount++;
            }
        }

        // ── Chat messages ─────────────────────────────────────────────────────
        $allStaff = array_merge([$admin], $staffUsers);
        $chatSamples = [
            'Miredita te gjitheve! Si po shkojne punet sot?',
            'Kam nevoje per ndihme me instalimin e antenes ne Prizren.',
            'Kontrata KNT-2026-1045 eshte duke skaduar, kush mund ta kontaktoje klientin?',
            'Antena 5G ne Gjilan po ka probleme teknike, po e investigoj.',
            'Takimi i ekipit eshte sot ne oren 14:00.',
            'Klienti Arben Ahmeti po pret instalimin e fiber optik.',
            'Raporti mujor eshte gati, e kam derguar tek te gjithe.',
            'Kush eshte on-call sot per supportin teknik?',
            'Antena LTE-045 u riparua me sukses!',
            'Ju lutem konfirmoni nese keni marre ndryshimet e fundit.',
            'Kam tre ankesa te hapura, po i trajtoj me radhe.',
            'Sistemi 5G ne Dardania eshte online dhe funksionon perfekt!',
            'Duhet te shohim numrin e klienteve te rinj te muajit.',
        ];

        foreach ($chatSamples as $idx => $msg) {
            $sender = $allStaff[array_rand($allStaff)];
            ChatMessage::create([
                'sender_id'  => $sender->id,
                'mesazhi'    => $msg,
                'created_at' => now()->subMinutes(count($chatSamples) * 5 - $idx * 5),
                'updated_at' => now()->subMinutes(count($chatSamples) * 5 - $idx * 5),
            ]);
        }

        // ── Sample tasks ──────────────────────────────────────────────────────
        $taskSamples = [
            ['Instalo antenen 5G ne Prizren Qender',           'antenna_setup',    'high',   $technicianId],
            ['Mirembaj antenen LTE-023 ne Ferizaj',            'maintenance',      'medium', $engineerId],
            ['Kontakto 10 kliente me kontratat skaduese',       'contract_renewal', 'urgent', $staffUsers[2]->id],
            ['Trajto ankesen #A-201 te klientit Gashi',        'complaint',        'high',   $staffUsers[3]->id],
            ['Instalo fiber optik te zona industriale Gjilan',  'antenna_setup',    'medium', $engineerId],
        ];

        foreach ($taskSamples as $t) {
            Task::create([
                'titulli'     => $t[0],
                'tipi'        => $t[1],
                'prioriteti'  => $t[2],
                'statusi'     => 'pending',
                'assigned_to' => $t[3],
                'assigned_by' => $admin->id,
                'due_date'    => now()->addDays(mt_rand(1, 14))->format('Y-m-d'),
            ]);
        }

        $this->command->info('Seeder u ekzekutua me sukses!');
        $this->command->info('  Admin: admin@telekomyt.com / admin123');
        $this->command->info('  Staff: fatos@telekomyt.com / password123');
        $this->command->info('  Portal klient: [emri].[mbiemri][nr]@email.com / client123');
    }
}
