/**
   * Created By EmmyHenz
   * Contact Me on wa.me/2349125042727
*/
module.exports = {
  apps: [{
    name: "tg-bot",
    script: "./src/index.js",
    watch: false,          // FIX: watch:true was restarting on any file change
    autorestart: true,
    max_memory_restart: "1500M",
    node_args: "--max-old-space-size=1400 --expose-gc --no-deprecation",
    env: {
      NODE_ENV: "production"
    },
    combine_logs: true,
    time: false,
    restart_delay: 5000,
    exp_backoff_restart_delay: 100,
    max_restarts: 50,
    min_uptime: "10s",
    wait_ready: false,     // FIX: was true but server.js never sends process.send('ready')
                           // PM2 was killing app after listen_timeout (30s) every time
    listen_timeout: 10000
  }]
};
