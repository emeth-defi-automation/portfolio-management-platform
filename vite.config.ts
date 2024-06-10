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
                key: process.env.CERT_KEY_PATH,
                cert: process.env.CERT_PATH,
            },
        },
        preview: {
            headers: {
                "Cache-Control": "public, max-age=600",
            },
        },
    };
});
