```
╭───╮╭─╮  
│   ││ │╭─╮╭──┬──┬─╮╭───╮╭───╮   
│   ││ │├─┤│ ╭╮ ╭╮ ││ ─ ││╭╮ │  ╭────────┬─────────────────────╮
╰╮  ╰╯╭╯│ ││ ││ ││ ││  ─┤│╰╯ │  | UPLOAD │ ▒▒▒▒▒▒▒▒▒▒▒░░░░ %75 |                    
 ╰────╯ ╰─╯╰─╯╰─╯╰─╯╰───╯╰───╯  ╰────────┴─────────────────────╯                    
```

[![Build Status](https://travis-ci.org/websemantics/vimeo-upload.svg?branch=master)](https://travis-ci.org/websemantics/vimeo-upload)
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg)](http://standardjs.com/)
[![npm version](https://badge.fury.io/js/vimeo-upload.svg)](https://badge.fury.io/js/vimeo-upload)
[![Bower version](https://badge.fury.io/bo/vimeo-upload.svg)](https://badge.fury.io/bo/vimeo-upload)
[![GitHub forks](https://img.shields.io/github/forks/websemantics/vimeo-upload.svg)](https://github.com/websemantics/vimeo-upload/network) [![GitHub stars](https://img.shields.io/github/stars/websemantics/vimeo-upload.svg)](https://github.com/websemantics/vimeo-upload/stargazers)
[![Percentage of issues still open](http://isitmaintained.com/badge/open/websemantics/vimeo-upload.svg)](http://isitmaintained.com/project/websemantics/vimeo-upload "Percentage of issues still open")
> Upload videos to your Vimeo account and update their metadata directly from a browser or a Node.js app.

Try it [LIVE](http://websemantics.github.io/vimeo-upload/)

## Install

Using Bower
```
bower install vimeo-upload
```

Or npm

```
npm install vimeo-upload
```

## Usage

Include `vimeo-upload.js` in your index.html.

```
<script src="bower_components/vimeo-upload/vimeo-upload.js"></script>
```

Create a new `VimeoUpload` initialized with a Blob or File and Vimeo Access Token then call `upload()` to start the upload process.

```javascript

var options = {
    preferredUploadDuration:  30,
    chunkSize:                1024*1024,
    token:                    "TOKEN_STRING_HERE", //Required on start.
    supportedFiles:           ["mov", "mpeg4", "mp4", "avi", "wmv", "mpegps", "flv", "3gpp", "webm"],
    name:                     "VIDEO_NAME",
    description:              "VIDEO_DESCRIPTION",
    file:                     null, //Required on start.
    upgrade_to_1080:          false
}

var uploader = new VimeoUpload(options);
uploader.start(options);

```

Your access token need to be authorized by Vimeo. Create new Vimeo access token [here](https://developer.vimeo.com/apps).

Check `index.html` for details and additional parameters you can include when initializing `VimeoUpload`.

## Credits

Sample code for uploading files directly with XHR/CORS: [cors-upload-sample](https://github.com/googledrive/cors-upload-sample)