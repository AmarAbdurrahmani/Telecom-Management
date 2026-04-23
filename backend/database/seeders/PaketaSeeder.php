<?php

namespace Database\Seeders;

use App\Models\Paket;
use Illuminate\Database\Seeder;

class PaketaSeeder extends Seeder
{
    public function run(): void
    {
        $paketat = [
            ['emri_paketes' => 'Pako START',    'cmimi_mujor' =>  5.99, 'lloji_sherbimit' => 'combo',    'data_gb' =>  2,  'minuta' => 100, 'sms' => 100, 'pershkrimi' => 'Ideale për pensionistë. 2GB + 100 Min/SMS.'],
            ['emri_paketes' => 'Pako TREND',    'cmimi_mujor' =>  9.99, 'lloji_sherbimit' => 'combo',    'data_gb' => 10,  'minuta' => null,'sms' => null,'pershkrimi' => '10GB + Minuta/SMS pakufi brenda rrjetit.'],
            ['emri_paketes' => 'Pako SOCIAL',   'cmimi_mujor' => 12.99, 'lloji_sherbimit' => 'internet', 'data_gb' => 20,  'minuta' => null,'sms' => null,'pershkrimi' => '20GB + Social Media pa harxhuar MB (FB, IG, TikTok).'],
            ['emri_paketes' => 'Pako STUDENT',  'cmimi_mujor' =>  8.49, 'lloji_sherbimit' => 'internet', 'data_gb' => 30,  'minuta' => null,'sms' => null,'pershkrimi' => '30GB + Edu-sites pa limit (UBT Portal, Moodle).'],
            ['emri_paketes' => 'Pako GIGA',     'cmimi_mujor' => 19.99, 'lloji_sherbimit' => 'combo',    'data_gb' => 50,  'minuta' => 500, 'sms' => null,'shpejtesia_mb' => 300, 'pershkrimi' => '50GB + 500 Min kombëtare, 5G Ready.'],
            ['emri_paketes' => 'Pako ULTRA',    'cmimi_mujor' => 29.99, 'lloji_sherbimit' => 'combo',    'data_gb' => 100, 'minuta' => null,'sms' => null,'shpejtesia_mb' => 500, 'pershkrimi' => '100GB + Min/SMS Pakufi kombëtare.'],
            ['emri_paketes' => 'Pako BUSINESS', 'cmimi_mujor' => 39.99, 'lloji_sherbimit' => 'combo',    'data_gb' => null,'minuta' => 100, 'sms' => null,'shpejtesia_mb' => 1000,'pershkrimi' => 'Unlimited Internet + 100 Min Ndërkombëtare.'],
            ['emri_paketes' => 'Pako FAMILY',   'cmimi_mujor' => 45.99, 'lloji_sherbimit' => 'combo',    'data_gb' => 200, 'minuta' => null,'sms' => null,'pershkrimi' => '3 SIM kartela + 200GB Shared Data.'],
            ['emri_paketes' => 'Pako VIP',      'cmimi_mujor' => 99.99, 'lloji_sherbimit' => 'combo',    'data_gb' => null,'minuta' => null,'sms' => null,'shpejtesia_mb' => 1000,'pershkrimi' => 'Unlimited çdo gjë + Concierge support prioritar.'],
            ['emri_paketes' => 'Pako M2M',      'cmimi_mujor' =>  2.99, 'lloji_sherbimit' => 'internet', 'data_gb' => 0.5, 'minuta' => null,'sms' => null,'pershkrimi' => '500MB vetëm (GPS tracking, Smart Home).'],
        ];

        foreach ($paketat as $p) {
            Paket::firstOrCreate(
                ['emri_paketes' => $p['emri_paketes']],
                array_merge(['aktive' => true, 'shpejtesia_mb' => null, 'minuta' => null, 'sms' => null, 'data_gb' => null], $p)
            );
        }
    }
}
