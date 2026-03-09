<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DemoPolicy extends Model
{
    protected $fillable = ['policy_number', 'customer_name', 'policy_duration', 'maturity_value', 'started_date'];
}
