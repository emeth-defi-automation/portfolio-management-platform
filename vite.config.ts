import { defineConfig, type UserConfig } from "vite";
import { qwikVite } from "@builder.io/qwik/optimizer";
import { qwikCity } from "@builder.io/qwik-city/vite";
import tsconfigPaths from "vite-tsconfig-paths";
import basicSsl from "@vitejs/plugin-basic-ssl";
import "dotenv/config"

export default defineConfig((): UserConfig => {
    return {
        plugins: [qwikCity(), qwikVite(), tsconfigPaths(), basicSsl()],
        server: {
            headers: {
                "Cache-Control": "public, max-age=0",
            },
            https: {
                key: "./ssl/127.0.0.1-key.pem",
                cert: "./ssl/127.0.0.1.pem",
            },
        },
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        },
    };
});
