import typescript from "@rollup/plugin-typescript";
export default {
  input: "./src/index.ts",
  output: [
    {
      format: "cjs",
      file: 'lib/petite-vue.cjs.js',
    },
    {
      format: "es",
      file: 'lib/petite-vue.esm.js',
    },
  ],

  plugins: [typescript()],
};
