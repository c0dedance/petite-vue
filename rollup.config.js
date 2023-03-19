import typescript from "@rollup/plugin-typescript";
export default {
  input: "./packages/vue/src/index.ts",
  output: [
    {
      format: "cjs",
      file: "packages/vue/dist/petite-vue.cjs.js",
    },
    {
      format: "es",
      file: "packages/vue/dist/petite-vue.esm.js",
    },
  ],

  plugins: [typescript()],
};
