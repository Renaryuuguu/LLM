const path = require("path");
const resolve = (dir) => path.resolve(__dirname, dir);

module.exports = {
  devServer: {
    compress: false,
    proxy: {
      "/api": {
        target: "https://spark-api-open.xf-yun.com",
        changeOrigin: true,
        pathRewrite: {
          "^/api": "",
        },
      },
    },
  },
  webpack: {
    alias: {
      "@": resolve("src"),
    },
  },
};
