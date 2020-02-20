# webhooks_build_server


> quick and ugly server for receiving github webhooks and re-building & re-deploying
> **now featuring less ugly**

*This branch is configured for my trivia web app hosted at JustTrivia.fun **

** Update: Now rolls back to last known-good commit if a redeploy fails **

This runs on the application server, which runs ubuntu 16.04. On push to the relevant repo, it receives an HTTP POST from github. Then it pulls in the changes, updates dependencies, rebuilds and restarts the relevant systemd service.

It has minimal JS dependencies, only some built-ins like the `http` module and the IMO excellent [node-github-webhook](https://github.com/excaliburhan/node-github-webhook). I think system dependencies are just a linux distro with git, systemd & NGINX. And whatever your application needs, of course. In this case, node, npm, etc.

This server runs as a systemd service itself, see the `systemd` folder. This handles logging, start on boot, etc (no longer auto-restarts process, a crash means multiple failures and requires manual intervention). I could probably have it redeploy itself on push, but that is getting a little meta.

Supports multiple repos, in this case a [front-end vue/nuxt app](https://github.com/jeremy21212121/trivia-frontend) and a [back-end express service](https://github.com/jeremy21212121/express-trivia-server). I use NGINX for TLS termination and reverse proxying.

All the `git pull`-ing and `npm install`-ing is handled by shell scripts in the bash folder. Failure of a redeploy script causes the application to be rolled back to the last known-good commit. Failure of the rollback script sends me a sternly-worded email and exits the process.

With this arrangement, any tests should be run on the dev machine ie. using pre-commit git hooks. This currently has no ability to run tests itself, but it could be easily bodged in to the bash scripts if needed in the future.
