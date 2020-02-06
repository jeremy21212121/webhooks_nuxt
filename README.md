# webhooks_nuxt
> github webhooks server for triggering nuxt rebuilds and restart of the systemd service on push

This runs on the application server, which runs ubuntu. On push to the relevant repo it pulls in the changes, updates dependencies, rebuilds and restarts the relevant systemd service.

Supports multiple repos, in this case a dev and production site.

Be warned, much of the functionality is acheived by running shell commands. It was simple and has proven to be surprisingly reliable, with continous uptime of months without crashing or build failure.

With this arrangement, any tests should be run on the dev machine ie. using pre-commit git hooks. This has no ability to run tests currently.
