<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class SuperAdminFactory extends Factory
{

    public function definition(): array
    {

        return [
            'email' => fake()->unique()->safeEmail(),
            'password' => bcrypt('secret'),
            'career' => fake()->randomElement('SA'),

        ];
    }
}
