"use client";
import { Suspense } from "react";
import NavigationProgress from "./NavigationProgress";

// Wrapper dengan Suspense wajib karena NavigationProgress
// menggunakan useSearchParams() yang butuh Suspense boundary
export default function NavigationProgressWrapper() {
    return (
        <Suspense fallback={null}>
            <NavigationProgress />
        </Suspense>
    );
}
