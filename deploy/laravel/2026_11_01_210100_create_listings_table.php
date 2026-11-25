<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('listings', function (Blueprint $table) {
            $table->id();
            $table->uuid('public_id')->unique();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('category_id', 80);
            $table->string('category_path', 255);
            $table->string('title', 200);
            $table->string('slug', 220)->unique();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price')->nullable();
            $table->char('currency', 3)->default('RUB');
            $table->string('price_suffix', 40)->nullable();
            $table->string('region_id', 40)->nullable();
            $table->string('place', 160)->nullable();
            $table->string('kind', 32);
            $table->string('status', 20)->default('draft');
            $table->json('attributes')->nullable();
            $table->decimal('lat', 10, 7)->nullable();
            $table->decimal('lng', 10, 7)->nullable();
            $table->timestamp('published_at')->nullable();
            $table->timestamps();

            $table->foreign('category_id')->references('id')->on('categories')->restrictOnDelete();
            $table->index(['status', 'published_at']);
            $table->index(['category_path', 'status']);
            $table->index(['region_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('listings');
    }
};
