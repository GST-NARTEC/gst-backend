module.exports = {
  apps: [
    {
      name: "gst-ksa",
      script: "./app.js",
      watch: false,
    },
    {
      name: "gst-ksa-workers",
      script: "./workers/index.js",
      watch: false,
    },
  ],
};
