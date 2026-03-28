<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\Vendor;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    public function vendors(): JsonResponse
    {
        $vendors = Vendor::query()
            ->approved()
            ->orderBy('business_name')
            ->limit(32)
            ->get();

        $columns = $vendors->map(function ($vendor) {
            return [
                'label' => $vendor->business_name,
                'to'    => '/vendors/' . $vendor->slug,
            ];
        })->chunk(8)->values()->toArray();

        return response()->json([
            'id'      => 'vendors',
            'label'   => 'Vendors',
            'title'   => 'Shop Popular vendors',
            'cta'     => ['label' => 'See All Vendors', 'to' => '/vendors'],
            'columns' => $columns,
        ]);
    }

    public function categories(): JsonResponse
    {
        $menswearCategory = Category::where('slug', 'mens-wear')->with('children.children')->first();
        $womenswearCategory = Category::where('slug', 'women-wears')->with('children.children')->first();

        $formatCategoryMenu = function ($category, $id, $label, $title, $cta) {
            $columns = [];
            if ($category && $category->children) {
                foreach ($category->children as $child) {
                    $links = [];
                    if ($child->children) {
                        foreach ($child->children as $grandchild) {
                            $links[] = [
                                'label' => $grandchild->name,
                                'to'    => '/categories/' . $grandchild->slug,
                            ];
                        }
                    }
                    $columns[] = [
                        'heading' => [
                            'label' => $child->name,
                            'to'    => '/categories/' . $child->slug,
                        ],
                        'links'   => $links,
                    ];
                }
            }

            return [
                'id'      => $id,
                'label'   => $label,
                'title'   => $title,
                'cta'     => $cta,
                'columns' => $columns,
            ];
        };

        return response()->json([
            'menswear'   => $formatCategoryMenu(
                $menswearCategory,
                'menswear',
                'MENSWEAR',
                'Shop By Category',
                ['label' => 'See All Categories', 'to' => '/categories/all']
            ),
            'womenswear' => $formatCategoryMenu(
                $womenswearCategory,
                'womenswear',
                'WOMENSWEAR',
                'Shop By Category',
                ['label' => 'See All Categories', 'to' => '/categories/womenswear/all']
            ),
        ]);
    }
}
