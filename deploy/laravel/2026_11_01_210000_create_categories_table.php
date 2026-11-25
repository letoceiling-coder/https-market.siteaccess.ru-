<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('categories', function (Blueprint $table) {
            $table->string('id', 80);
            $table->string('parent_id', 80)->nullable();
            $table->string('slug', 80);
            $table->string('path', 255)->unique();
            $table->string('name', 160);
            $table->text('description')->nullable();
            $table->string('listing_kind', 32);
            $table->string('attribute_set', 40);
            $table->string('moderation', 20)->default('review');
            $table->string('icon', 40)->nullable();
            $table->unsignedSmallInteger('sort_order')->default(0);
            $table->unsignedTinyInteger('depth')->default(0);
            $table->string('seo_title', 200)->nullable();
            $table->string('seo_description', 400)->nullable();
            $table->json('sorts')->nullable();
            $table->json('rules')->nullable();
            $table->boolean('is_published')->default(true);
            $table->timestamps();
            $table->primary('id');
            $table->index(['parent_id', 'sort_order']);
        });

        Schema::table('categories', function (Blueprint $table) {
            $table->foreign('parent_id')->references('id')->on('categories')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('categories');
    }
};
