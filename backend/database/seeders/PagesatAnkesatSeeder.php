<?php

namespace Database\Seeders;

use App\Models\Ankese;
use App\Models\Client;
use App\Models\Fature;
use App\Models\Pagese;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PagesatAnkesatSeeder extends Seeder
{
    public function run(): void
    {
        $this->seedPagesat();
        $this->seedAnkesat();
    }

    // ── PAGESAT ───────────────────────────────────────────────────────────────

    private function seedPagesat(): void
    {
        // Take faturat that are not already fully paid
        $faturat = Fature::whereIn('statusi', ['e_papaguar', 'e_vonuar'])
            ->with('kontrate')
            ->inRandomOrder()
            ->limit(60)
            ->get();

        if ($faturat->isEmpty()) {
            $this->command->warn('  ⚠  Nuk ka fatura të papaguara — Pagesat u kaluan.');
            return;
        }

        $metodat    = ['cash', 'online', 'transfer'];
        $metodaWeights = [50, 30, 20]; // cash 50%, online 30%, transfer 20%

        $referencat = [
            'cash'     => ['KES-{rand}', 'CASH-{rand}', null, null],
            'online'   => ['pi_{rand}_stripe', 'ch_{rand}_stripe', 'PAY-{rand}'],
            'transfer' => ['TRF-{rand}', 'BANK-{rand}-PRO', 'REF-{rand}-KB'],
        ];

        $shenime = [
            'Pagesa e rregullt mujore.',
            'Pagua në arkë — sporteli qendror.',
            'Pagua përmes internet banking.',
            'Klienti pagoi me vonesë — u njoftua.',
            'Pagesa e plotë. Fatura u mbyll.',
            null, null, null,
        ];

        $count = 0;

        foreach ($faturat as $fature) {
            $totali = (float) $fature->totali;

            // Decide: full payment (80%) or partial (20%)
            $isPartial = (mt_rand(1, 100) <= 20);

            // Pick method by weight
            $rand = mt_rand(1, 100);
            $cumulative = 0;
            $metoda = 'cash';
            foreach ($metodat as $i => $m) {
                $cumulative += $metodaWeights[$i];
                if ($rand <= $cumulative) { $metoda = $m; break; }
            }

            $shuma = $isPartial
                ? round($totali * (mt_rand(30, 70) / 100), 2)
                : $totali;

            // Generate reference
            $refTemplates = $referencat[$metoda];
            $refTpl = $refTemplates[array_rand($refTemplates)];
            $referenca = $refTpl ? str_replace('{rand}', strtoupper(substr(md5(uniqid()), 0, 8)), $refTpl) : null;

            // Date: between invoice issue date and today
            $daysAgo = mt_rand(1, 60);
            $dataPageses = now()->subDays($daysAgo)->format('Y-m-d');

            Pagese::create([
                'fature_id'    => $fature->fature_id,
                'shuma'        => $shuma,
                'data_pageses' => $dataPageses,
                'metoda'       => $metoda,
                'referenca'    => $referenca,
                'shenime'      => $shenime[array_rand($shenime)],
            ]);

            // Sync fature statusi
            $totalPaguar = Pagese::where('fature_id', $fature->fature_id)->sum('shuma');
            if ($totalPaguar >= $totali) {
                $fature->update(['statusi' => 'e_paguar', 'data_pageses' => $dataPageses]);
            }

            $count++;
        }

        $this->command->info("  ✓  Pagesat: {$count} pagesa u shtuan.");
    }

    // ── ANKESAT ───────────────────────────────────────────────────────────────

    private function seedAnkesat(): void
    {
        $klientet  = Client::inRandomOrder()->limit(80)->pluck('klient_id')->toArray();
        $punonjsit = User::whereIn('roli', ['admin', 'punonjes', 'agjent', 'agjent_support'])
            ->pluck('id')
            ->toArray();

        if (empty($klientet)) {
            $this->command->warn('  ⚠  Nuk ka klientë — Ankesat u kaluan.');
            return;
        }

        // Fallback: any user if no staff
        if (empty($punonjsit)) {
            $punonjsit = User::pluck('id')->toArray();
        }

        $ankesat = $this->ankesatData();
        $count = 0;

        foreach ($ankesat as $a) {
            $klientId   = $klientet[array_rand($klientet)];
            $punonjsId  = !empty($punonjsit) ? $punonjsit[array_rand($punonjsit)] : null;
            $daysAgo    = $a['days_ago'];
            $dataAnkeses = now()->subDays($daysAgo)->format('Y-m-d');

            $dataZgjidhjes = null;
            if (in_array($a['statusi'], ['e_zgjidhur', 'e_mbyllur']) && isset($a['resolved_after'])) {
                $dataZgjidhjes = now()->subDays($daysAgo - $a['resolved_after'])->format('Y-m-d');
            }

            Ankese::create([
                'klient_id'           => $klientId,
                'punonjes_id'         => $punonjsId,
                'kategoria'           => $a['kategoria'],
                'pershkrimi'          => $a['pershkrimi'],
                'data_ankeses'        => $dataAnkeses,
                'statusi'             => $a['statusi'],
                'pergjigja'           => $a['pergjigja'] ?? null,
                'data_zgjidhjes'      => $dataZgjidhjes,
                'ka_kompensim'        => $a['ka_kompensim'] ?? false,
                'arsyeja_kompensimit' => $a['arsyeja_kompensimit'] ?? null,
                'shuma_kompensimit'   => $a['shuma_kompensimit'] ?? null,
                'kanali_njoftimit'    => $a['kanali_njoftimit'],
            ]);

            $count++;
        }

        $this->command->info("  ✓  Ankesat: {$count} ankesa u shtuan.");
    }

    private function ankesatData(): array
    {
        return [
            // ── TEKNIK ─────────────────────────────────────────────────────────
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Interneti është jashtëzakonisht i ngadaltë që nga e hëna. Shpejtësia e matур me speedtest është 2 Mbps, ndërkohë paketa ime ka 100 Mbps. Kam rinisur routerin disa herë pa rezultat.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'U konstatua problem me nyjën OLT-07 në lagjen tuaj. Defekti u riparua dhe shërbimi u restaurua plotësisht. Shpejtësia është tani normale. Na vjen keq për inconvenience-in.',
                'days_ago'   => 14,
                'resolved_after' => 2,
                'ka_kompensim' => true,
                'arsyeja_kompensimit' => 'Ndërprerje shërbimi > 24 orë',
                'shuma_kompensimit' => 9.99,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Nuk kam asnjë sinjal 5G megjithëse paketa ime përfshin 5G dhe ndodhem qendrës së Prishtinës. Telefoni tregon vetëm 4G LTE.',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Kemi iniciuar analizën e sinjalizimit 5G në zonën tuaj. Inxhinierët po punojnë në zgjidhje. Ju do të njoftoheni brenda 48 orëve.',
                'days_ago'   => 5,
                'resolved_after' => null,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Router-i i dhënë nga kompania nuk lidhet me kabëllin optik. Drita WAN është gjithmonë e kuqe. Nuk mund të punoj nga shtëpia.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Tekniku ynë vizitoi banesën tuaj dhe konstatoi defekt hardware të router-it. U zëvendësua me pajisje të re dhe lidhja është aktive.',
                'days_ago'   => 20,
                'resolved_after' => 1,
                'ka_kompensim' => false,
                'kanali_njoftimit' => 'portal',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Kam ndërprerje të shpeshta të internetit çdo ditë midis orës 18:00-22:00. Duket si overload i rrjetit në orët e pikut.',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Kemi identifikuar ngarkesë të lartë të segmentit tuaj të rrjetit. Po planifikojmë zgjerim të kapacitetit. Ndërkohë po optimizojmë trafikun.',
                'days_ago'   => 8,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Pas rinovimit të kontratës humba aksesin te numri i vjetër i telefonit. Numri nuk transferohet te linja e re.',
                'statusi'    => 'e_re',
                'pergjigja'  => null,
                'days_ago'   => 2,
                'kanali_njoftimit' => 'sms',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Antena e jashtme është dëmtuar nga stuhia e fundit dhe ka rënë nga çatia. Jam pa internet prej 3 ditësh.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Ekipi teknik vizitoi vendodhjen dhe instaloi antenën e re. Lidhja është restauruar plotësisht. Klient i kompensuar për ditët pa shërbim.',
                'days_ago'   => 25,
                'resolved_after' => 3,
                'ka_kompensim' => true,
                'arsyeja_kompensimit' => 'Ndërprerje shërbimi nga dëmtim infrastrukture',
                'shuma_kompensimit' => 14.99,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Shpejtësia e upload-it është shumë e ulët (0.5 Mbps) ndërkohë download funksionon mirë. Problem me asimetri të lidhjes.',
                'statusi'    => 'e_mbyllur',
                'pergjigja'  => 'U konstatua konfigurim i gabuar i profilit ADSL. U korrigjua nga distanca dhe shpejtësia u normalizua. Problem i zgjidhur.',
                'days_ago'   => 40,
                'resolved_after' => 5,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Nuk mund të bëj thirrje ndërkombëtare megjithëse paketa ime e përfshin këtë shërbim. Marr mesazhin "Ky shërbim nuk është aktiv".',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'U aktivizua shërbimi i thirrjeve ndërkombëtare i cili kishte mbetur i çaktivizuar pas migrimit të sistemit. Tani mund të bëni thirrje ndërkombëtare normalisht.',
                'days_ago'   => 10,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'sms',
            ],

            // ── FATURIM ────────────────────────────────────────────────────────
            [
                'kategoria'  => 'faturim',
                'pershkrimi' => 'Fatura e muajit mars është 45.99€ ndërkohë paketa ime kushton 19.99€/muaj. Nuk kuptoj pse diferenca është kaq e madhe. Kërkoj sqarim dhe rimbursim nëse ka gabim.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'U konstatua faturim i gabuar — u aplikua tarifa e gabuar pas ndryshimit të paketës. U lëshua notë krediti prej 26.00€ dhe fatura u korrigjua. Na vjen keq.',
                'days_ago'   => 18,
                'resolved_after' => 3,
                'ka_kompensim' => true,
                'arsyeja_kompensimit' => 'Faturim i gabuar — tarifa e paketës',
                'shuma_kompensimit' => 26.00,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'faturim',
                'pershkrimi' => 'Kam paguar faturën e shkurtit me transfer bankar para 5 ditëve por sistemi ende tregon "E papaguar". Kam dëshmi të pagesës.',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Kemi marrë referimin tuaj të pagesës dhe po e verifikojmë me departamentin financiar. Procesimi mund të zgjasë 2-3 ditë pune.',
                'days_ago'   => 5,
                'kanali_njoftimit' => 'portal',
            ],
            [
                'kategoria'  => 'faturim',
                'pershkrimi' => 'Mu dërgua faturë për pajisje të cilën nuk e kam marrë kurrë. Kam kontratë vetëm për internet, jo pajisje.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Pas verifikimit u konstatua gabim sistemi — fatura e pajisjes ishte caktuar gabimisht te kontrata juaj. Fatura u anulua. Llogaria juaj është e rregullt.',
                'days_ago'   => 30,
                'resolved_after' => 4,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'faturim',
                'pershkrimi' => 'Ju lutemi sqaroni pse mu aplikua penalitet prej 15€ në faturën e fundit. Nuk kam pasur vonesë në pagesë.',
                'statusi'    => 'e_mbyllur',
                'pergjigja'  => 'Pas rishikimit u konstatua se penaliteti ishte aplikuar gabimisht — pagesa ishte procesuar brenda afatit por me vonesë regjistrim. Penaliteti u hoq dhe fatura u rregullua.',
                'days_ago'   => 45,
                'resolved_after' => 6,
                'ka_kompensim' => true,
                'arsyeja_kompensimit' => 'Penalitet i aplikuar gabimisht',
                'shuma_kompensimit' => 15.00,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'faturim',
                'pershkrimi' => 'Nuk po marr fatura mujore në email. Kisha dakorduar faturim elektronik por nuk kam marrë asgjë prej 3 muajsh.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Email-i juaj i regjistruar ishte i gabuar — kishte një shkronjë shtesë. E korrijuam dhe ju dërguam të 3 faturat e humbura. Tani do t\'i merrni rregullisht.',
                'days_ago'   => 12,
                'resolved_after' => 2,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'faturim',
                'pershkrimi' => 'Sistemi online nuk po pranon kartelën time të kreditit kur mundohem të paguaj faturën. Provova me dy kartela të ndryshme.',
                'statusi'    => 'e_re',
                'pergjigja'  => null,
                'days_ago'   => 1,
                'kanali_njoftimit' => 'portal',
            ],

            // ── SHERBIMI ───────────────────────────────────────────────────────
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Agjenti i shitjeve më premtoi bonus 2 muaj falas nëse firmosja kontratën 24-mujore, por këto benefite nuk u reflektuan asnjëherë në llogari.',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Kemi kontaktuar agjentin dhe po investigojmë premtimin e bërë. Do të merrni përgjigje brenda 5 ditëve pune.',
                'days_ago'   => 7,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Dua të anuloj kontratën pasi jam zhgënjyer nga cilësia e shërbimit. Ndodhem ende brenda periudhës provuese 14-ditore.',
                'statusi'    => 'e_mbyllur',
                'pergjigja'  => 'Pas konsultimit me mbikëqyrësin, kontrata u anulua brenda periudhës provuese sipas kushteve të kontratës. Nuk do të ketë asnjë penalitet.',
                'days_ago'   => 22,
                'resolved_after' => 3,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Kam pritur tekniku 3 herë dhe asnjëherë nuk erdhi në orën e caktuar. Humba punë 3 ditë për t\'i pritur. Kjo është joprofesionale.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Kërkojmë ndjesë të sinqerta për mungesën e profesionalizmit. Inxhinieri u erdhi në shtëpi brenda 24 orëve. Ju kemi kompensuar me muaj falas si shenjë mirëkuptimi.',
                'days_ago'   => 35,
                'resolved_after' => 2,
                'ka_kompensim' => true,
                'arsyeja_kompensimit' => 'Dëm kohor nga mosrespektimi i takimeve',
                'shuma_kompensimit' => 19.99,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Call center nuk është i arritshëm. Kam provuar të telefonoj 5 herë sot dhe askush nuk u përgjigj. Linja qëndron në pritje dhe hidhet.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Kishim vëllim të pazakontë thirrjesh atë ditë. U shtuan agjentë shtesë dhe koha e pritjes u ul. Mund të na kontaktoni edhe nëpërmjet chat online.',
                'days_ago'   => 9,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Agjenti i mbështetjes ishte shumë i pasjellshëm dhe refuzoi t\'i sqaronte pyetjet e mia. Ndihem i keqtrajtuar si klient.',
                'statusi'    => 'e_mbyllur',
                'pergjigja'  => 'Ankesa juaj u trajtua seriozisht. U bë seancë ndërgjegjësuese me ekipin. Menaxheri u kontaktua personalisht me ju. Faleminderit për feedback-un.',
                'days_ago'   => 50,
                'resolved_after' => 7,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Dua të kaloj nga paketa Basic te paketa GIGA por sistemi online tregon gabim. Kam provuar prej 3 ditësh pa sukses.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Kishte një bug të sistemit CRM për ndryshimin e paketave online. E zgjidhëm manualisht — paketa juaj është tani GIGA aktive që nga sot.',
                'days_ago'   => 16,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'portal',
            ],
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Aplikacioni celular i TelekomMS nuk funksionon fare — hapja dështon menjëherë pas update-it të fundit.',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Bug i konfirmuar në versionin 2.1.4 të aplikacionit. Ekipi i zhvillimit po punon në patch. Update do të dalë brenda 48 orëve.',
                'days_ago'   => 3,
                'kanali_njoftimit' => 'sms',
            ],

            // ── PORTABILITETI ──────────────────────────────────────────────────
            [
                'kategoria'  => 'portabiliteti',
                'pershkrimi' => 'Kërkova portabilitet të numrit tim +383-44-XXX-XXX nga operatori i vjetër para 10 ditësh. Ende nuk kam konfirmim dhe numri nuk është aktiv.',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Procesi i portabilitetit është në fazën e verifikimit nga operatori donator. Sipas rregullatorit kjo mund të zgjasë deri 15 ditë pune. Ju do të njoftoheni me SMS.',
                'days_ago'   => 10,
                'kanali_njoftimit' => 'sms',
            ],
            [
                'kategoria'  => 'portabiliteti',
                'pershkrimi' => 'Portabiliteti dështoi dhe humba numrin tim të vjetër. Numri nuk është as te operatori i ri as te i vjetri. Ky numër është shumë i rëndësishëm për biznesin tim.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Pas ndërhyrjes urgjente me operatorin donator dhe ARKEP, numri u restaurua. Çështja ishte konflikte teknike midis sistemeve. Jemi shumë të ndjesë për shqetësimin.',
                'days_ago'   => 28,
                'resolved_after' => 3,
                'ka_kompensim' => true,
                'arsyeja_kompensimit' => 'Humbje e përkohshme e numrit — dëm biznesi',
                'shuma_kompensimit' => 29.99,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'portabiliteti',
                'pershkrimi' => 'Nuk po mundem të bëj portabilitet pasi sistemi refuzon kërkesën duke thënë "numri nuk është i portabilizueshëm". Por ky është numër standard kosovar.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Pas verifikimit, numri kishte një bllokues administrativ të vjetër. E hoqëm dhe portabiliteti u procesua me sukses. Numri është tani aktiv.',
                'days_ago'   => 42,
                'resolved_after' => 5,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'portabiliteti',
                'pershkrimi' => 'Dorëzova dokumentet për portabilitet por pas 20 ditësh ende nuk ka lëvizur asgjë. Nuk marr asnjë update.',
                'statusi'    => 'e_re',
                'pergjigja'  => null,
                'days_ago'   => 2,
                'kanali_njoftimit' => 'portal',
            ],

            // ── TJETER ────────────────────────────────────────────────────────
            [
                'kategoria'  => 'tjeter',
                'pershkrimi' => 'Dua të di si funksionon sistemi i pikëve besnikërie. Kam kontratë 3-vjeçare dhe asnjëherë nuk kam marrë asnjë pikë apo benefite.',
                'statusi'    => 'e_mbyllur',
                'pergjigja'  => 'Programi i besnikërisë u lançua zyrtarisht vetëm 6 muaj më parë. Klientët me kontrata aktive kanë marrë pikë retroaktivisht. Mund t\'i shikoni në portalin tuaj nën "Profili → Pikët e mia".',
                'days_ago'   => 55,
                'resolved_after' => 2,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'tjeter',
                'pershkrimi' => 'Dëshiroj të transferoj kontratën time tek bashkëshortja ime. A është kjo e mundur dhe çfarë dokumentesh nevojiten?',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Transferimi i kontratës është i mundur. Ju nevojiten: letërnjoftimi i të dy palëve + formularit i transferimit (i disponueshëm në çdo zyrë ose online). Procesi zgjat 3-5 ditë pune.',
                'days_ago'   => 15,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'portal',
            ],
            [
                'kategoria'  => 'tjeter',
                'pershkrimi' => 'Adresa ime e re është në një ndërtesë të re dhe nuk ka kablim. A mund të instaloni fibër optik dhe cilat janë kostot e instalimit?',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Inxhinierët tanë do të vlerësojnë mundësinë e shtrirjes së fibres në zonën tuaj. Do t\'ju kontaktojmë brenda 5 ditëve me ofertën dhe kushtet.',
                'days_ago'   => 6,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'tjeter',
                'pershkrimi' => 'Kam marrë mesazh SMS se llogaria ime ka aktivitet të dyshimtë. Dua të ndryshoj fjalëkalimin dhe të verifikoj transaksionet.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Ekipi i sigurisë investigoi dhe konfirmoi se SMS ishte automatik nga sistemi ynë për hyrje të re nga pajisje e re. Asnjë aktivitet i paautorizuar nuk u gjet. Fjalëkalimi u rivendos.',
                'days_ago'   => 8,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'sms',
            ],
            [
                'kategoria'  => 'tjeter',
                'pershkrimi' => 'Dua informacion rreth mundësisë së kalimit nga paketë individuale në paketë biznesore pa ndërprerje shërbimi.',
                'statusi'    => 'e_mbyllur',
                'pergjigja'  => 'Kalimi bëhet pa ndërprerje. Kontratoni agjentin tonë të biznesit në linja të dedikuara: 038-XXX-XXX (opt. 2). Migrimime janë planifikuar për fundjavë kur trafiku është i ulët.',
                'days_ago'   => 33,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'email',
            ],
            [
                'kategoria'  => 'tjeter',
                'pershkrimi' => 'Kur erdha të rinovoja kontratën në zyrë, agjentja nuk i priste klientët dhe zyrja ishte e mbyllur gjatë orarit zyrtar 10:00.',
                'statusi'    => 'e_mbyllur',
                'pergjigja'  => 'Agjentja kishte detyrim urgjent atë ditë. Menaxheri do ta adresojë direkt. Ju u kontaktua dhe takimi u bë të nesërmen. Faleminderit për durimin tuaj.',
                'days_ago'   => 60,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Pas ndërprerjes së dritave, routeri nuk u ndez më. Drita power është fikur plotësisht. Duket si dëmtim nga tensioni.',
                'statusi'    => 'e_re',
                'pergjigja'  => null,
                'days_ago'   => 1,
                'kanali_njoftimit' => 'telefon',
            ],
            [
                'kategoria'  => 'faturim',
                'pershkrimi' => 'Kam dy kontrata aktive por fatura e dytë nuk shfaqet në portalin tim online. Si mund ta shoh dhe paguaj?',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Llogaria juaj kishte dy profile të ndara. I bashkuam nën një llogari të vetme — tani mund t\'i shihni të dyja kontratat dhe faturat nën një hyrje.',
                'days_ago'   => 19,
                'resolved_after' => 2,
                'kanali_njoftimit' => 'portal',
            ],
            [
                'kategoria'  => 'sherbimi',
                'pershkrimi' => 'Paketa ime ka expiret por nuk mora asnjë njoftim paraprak. Mësova vetëm kur interneti u ndërpre papritur.',
                'statusi'    => 'e_zgjidhur',
                'pergjigja'  => 'Njoftimet automatike nuk u dërguan për shkak të një gabim konfigurimi. E rregulluam dhe tani do merrni SMS + email 30, 15, dhe 7 ditë para skadimit.',
                'days_ago'   => 23,
                'resolved_after' => 1,
                'kanali_njoftimit' => 'sms',
            ],
            [
                'kategoria'  => 'teknik',
                'pershkrimi' => 'Kamera IP e instaluar nga TelekomMS nuk transmetons imazhe reale — shfaqet imazh i ngrirë. Kam sistem sigurie të lidhur me këtë kamerë.',
                'statusi'    => 'ne_process',
                'pergjigja'  => 'Tekniku do të vizitojë brenda 48 orëve. Ndërkohë provoni ta çaktivizoni dhe aktivizoni kamerën nga aplikacioni.',
                'days_ago'   => 4,
                'kanali_njoftimit' => 'email',
            ],
        ];
    }
}
