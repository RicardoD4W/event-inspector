import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, "", "");
  return {
    plugins: [react()],
    build: {
      outDir: "dist",
      emptyOutDir: true,
      target: "chrome120",
      minify: "esbuild",
      sourcemap: false,
      rollupOptions: {
        input: {
          "bootstrap": resolve(__dirname, "src/bootstrap.ts"),
          "content-script": resolve(__dirname, "src/presentation/entry/content-script.tsx"),
          background: resolve(__dirname, "src/background.ts"),
        },
        output: {
          entryFileNames: "[name].js",
          codeSplitting: false,
        },
      },
    },
    define: {
      "process.env.NODE_ENV": JSON.stringify(env.NODE_ENV || "production"),
    },
  };
});
