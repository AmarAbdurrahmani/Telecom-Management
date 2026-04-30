<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Antenna extends Model {
    protected $table = 'antennas';
    protected $primaryKey = 'antenna_id';
    protected $fillable = ['emri','lat','lon','tipi','statusi','coverage_radius_m','installed_by','qyteti','shenimet'];

    public function installuesiNgaUser() {
        return $this->belongsTo(User::class, 'installed_by');
    }
    public function tasks() {
        return $this->hasMany(Task::class, 'antenna_id', 'antenna_id');
    }
}
