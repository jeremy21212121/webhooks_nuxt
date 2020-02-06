# webhooks_nuxt
> quick and ugly github webhook server for redeploying on push

This runs on the application server, which runs ubuntu. On push to the relevant repo it pulls in the changes, updates dependencies, rebuilds and restarts the relevant systemd service. It has minimal dependencies, only the built-in `http` module and the IMO excellent [node-github-webhook](https://github.com/excaliburhan/node-github-webhook).

This server runs as a systemd service itself, see the `systemd` folder. This handles logging, restarting, etc (I call it daemonizing, but I don't know if that is a real word). I could probably have it redeploy itself on push, but that is getting a little meta.

Supports multiple repos, in this case a dev and production site. I use NGINX for TLS termination and reverse proxying.

Be warned, much of the functionality is acheived by running shell scripts (see `bash` folder). It was simple and has proven to be surprisingly reliable, with continous uptime of months without crashing or build failure.

With this arrangement, any tests should be run on the dev machine ie. using pre-commit git hooks. This currently has no ability to run tests itself, but it could be easily bodged in to the bash script.
