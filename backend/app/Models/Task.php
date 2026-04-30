<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;

class Task extends Model {
    protected $table = 'tasks';
    protected $primaryKey = 'task_id';
    protected $fillable = ['titulli','pershkrimi','tipi','prioriteti','statusi','assigned_to','assigned_by','antenna_id','due_date'];
    protected $casts = ['due_date' => 'date'];

    public function assignedTo() { return $this->belongsTo(User::class, 'assigned_to'); }
    public function assignedBy() { return $this->belongsTo(User::class, 'assigned_by'); }
    public function antenna() { return $this->belongsTo(Antenna::class, 'antenna_id', 'antenna_id'); }
}
