# MQClient

[![Discord](https://img.shields.io/badge/chat-on%20discord-7289da.svg?logo=discord)](https://discord.gg/sA4kmsxC7N)[![License](https://img.shields.io/github/license/FeroxFoxxo/MQClient)](https://github.com/FeroxFoxxo/MQClient/blob/master/LICENSE.md)

An Electron app that allows you to easily join MQ servers.

It automatically embeds the game, all in a few clicks!

For an overview of how the game client worked originally, please see [this section in the MQReawakened README](https://github.com/FeroxFoxxo/MQReawakened#architecture).

## Disclaimer

This repository does not contain any code from the actual MQ game client. **Think of it more as a launcher:** it abstracts away having to use a NPAPI plugin capable web browser, along with having to host a HTTP server for it to connect to.

In addition, if you are interested in contributing: do note that **this project likely cannot utilize more modern Javascript techniques**. In order to use NPAPI plugins, a very old version of Electron was needed (0.31.0). This limits the project to only a portion of ES5 in non-strict mode, and a reduced subset of Node/Electron APIs.

## Usage

Provided that you have npm installed, clone the repository, then run install like so:

```
git clone https://github.com/FeroxFoxxo/MQClient.git
npm install
```

After that has completed you can then test MQClient:

```
npm run start
```

If you would like to package it as a standalone win32 application:

```
npm run pack
```

You can then compress the application directory into a zip file and installer for distribution:

```
npm run dist
```

Before opening a PR or running pack/dist, please do a code formatting pass:

```
npm run prettier
```

## License

MIT unless specified otherwise
