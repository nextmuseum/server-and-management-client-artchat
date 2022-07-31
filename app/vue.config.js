const { defineConfig } = require('@vue/cli-service')
const path = require("path");

module.exports = defineConfig({
  outputDir: path.resolve(__dirname, "../api/app"),
  publicPath: (process.env.NODE_ENV !== 'local')
    ? '/app/'
    : '/',
  transpileDependencies: true,
  devServer: {
	proxy: {
	  '^/api': {
		target: 'http://localhost:4000',
		changeOrigin: true
	  },
	}
  }
})

