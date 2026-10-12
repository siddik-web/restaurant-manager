<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    protected bool $seed = true;

    public function test_api_routes_require_authentication(): void
    {
        $this->getJson('/api/recipes')->assertUnauthorized();
        $this->postJson('/api/orders', [])->assertUnauthorized();
        $this->deleteJson('/api/recipes/1')->assertUnauthorized();
        $this->getJson('/api/reports/daily-sales')->assertUnauthorized();
    }

    public function test_user_can_log_in_and_use_token(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass']);

        $token = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret-pass',
        ])
            ->assertOk()
            ->assertJsonPath('data.user.email', $user->email)
            ->json('data.token');

        $this->assertNotEmpty($token);

        $this->withToken($token)
            ->getJson('/api/user')
            ->assertOk()
            ->assertJsonPath('data.id', $user->id);
    }

    public function test_login_rejects_wrong_password(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass']);

        $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'wrong',
        ])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('email');
    }

    public function test_logout_revokes_token(): void
    {
        $user = User::factory()->create(['password' => 'secret-pass']);
        $token = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'secret-pass',
        ])->json('data.token');

        $this->withToken($token)->postJson('/api/logout')->assertOk();

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_seeder_creates_admin_account(): void
    {
        $this->postJson('/api/login', [
            'email' => 'admin@example.com',
            'password' => 'password',
        ])->assertOk();
    }
}
