import { browser } from '$app/environment';

export const prerender = false;
export const ssr = false;

// This ensures the app only runs in the browser (Tauri environment)
export async function load() {
    if (browser) {
        // Any browser-specific initialization can go here
        return {
            props: {}
        };
    }

    return {
        props: {}
    };
}