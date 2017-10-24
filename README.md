# Drake

![Drake](https://marksteve.com/drake/images/drake-256.png)

Keep your passwords in "chests" that are stored and synced to your Google Drive account.

## Features

* Nothing to install. All you need is a modern browser.
* Client-side encryption with https://github.com/bitwiseshiftleft/sjcl
* Password generator using https://github.com/rstacruz/passwordgen.js
* Syncs with Google Drive.
* Sharing with permissions thru Google Drive.

## Deploy

Drake is just a bunch of static files. There are no server-side components so
you can take advantage of Github Pages to deploy it from your own repo. Just
fork it.

## Develop

### Build requirements

```shell
$ npm install -g component coffee-script css-condense uglify-js
$ gem install sass
```

### Continually build if changes are detected

```shell
$ watch make  # https://github.com/visionmedia/watch
```

### Serve locally

```shell
$ serve  # https://github.com/visionmedia/serve
```

## License

https://marksteve.mit-license.org

## Drake?

Treasure chests can be locked and hold valuable items.
Drive. Dr... Drake. [Francis Drake](https://en.wikipedia.org/wiki/Francis_Drake).
