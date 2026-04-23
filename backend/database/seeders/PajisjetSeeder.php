<?php

namespace Database\Seeders;

use App\Models\Pajisje;
use Illuminate\Database\Seeder;

class PajisjetSeeder extends Seeder
{
    public function run(): void
    {
        $pajisjet = [
            ['emri' => 'iPhone 15 Pro',       'marka' => 'Apple',    'cmimi_cash' => 1199.00, 'cmimi_keste' => 49.99, 'muajt_kestes' => 24, 'pershkrimi' => '256GB, Titanium, 5G, Dynamic Island'],
            ['emri' => 'Samsung Galaxy S24 Ultra', 'marka' => 'Samsung', 'cmimi_cash' => 1249.00, 'cmimi_keste' => 51.99, 'muajt_kestes' => 24, 'pershkrimi' => '512GB, AI Camera, S-Pen, 5G'],
            ['emri' => 'Google Pixel 8',       'marka' => 'Google',   'cmimi_cash' =>  799.00, 'cmimi_keste' => 32.99, 'muajt_kestes' => 24, 'pershkrimi' => '128GB, Pure Android, 7 vjet update'],
            ['emri' => 'Xiaomi 14',            'marka' => 'Xiaomi',   'cmimi_cash' =>  899.00, 'cmimi_keste' => 36.99, 'muajt_kestes' => 24, 'pershkrimi' => '256GB, Leica Lens, HyperOS'],
            ['emri' => 'Samsung Galaxy A54',   'marka' => 'Samsung',  'cmimi_cash' =>  389.00, 'cmimi_keste' => 15.99, 'muajt_kestes' => 24, 'pershkrimi' => '128GB, Mid-range, 5000mAh'],
            ['emri' => 'iPhone 13',            'marka' => 'Apple',    'cmimi_cash' =>  549.00, 'cmimi_keste' => 21.99, 'muajt_kestes' => 24, 'pershkrimi' => '128GB, Refurbished/Promo, A15 Bionic'],
            ['emri' => 'Nothing Phone (2)',    'marka' => 'Nothing',   'cmimi_cash' =>  649.00, 'cmimi_keste' => 26.99, 'muajt_kestes' => 24, 'pershkrimi' => '256GB, Glyph Interface, Snapdragon 8+ Gen 1'],
            ['emri' => 'Honor Magic6 Lite',    'marka' => 'Honor',    'cmimi_cash' =>  349.00, 'cmimi_keste' => 13.99, 'muajt_kestes' => 24, 'pershkrimi' => '256GB, Ultra-tough screen, 5800mAh'],
            ['emri' => 'Motorola Edge 40',     'marka' => 'Motorola', 'cmimi_cash' =>  449.00, 'cmimi_keste' => 17.99, 'muajt_kestes' => 24, 'pershkrimi' => '256GB, Slim Design, 144Hz'],
            ['emri' => 'ZTE Blade V50',        'marka' => 'ZTE',      'cmimi_cash' =>  159.00, 'cmimi_keste' =>  5.99, 'muajt_kestes' => 24, 'pershkrimi' => '128GB, Budget Option, Dual SIM'],
        ];

        foreach ($pajisjet as $p) {
            Pajisje::firstOrCreate(['emri' => $p['emri']], $p);
        }
    }
}
