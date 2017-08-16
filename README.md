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
<script src="bower_components/vimeo-upload/dist/vimeo-upload.min.js"></script>
```

### Basic:

Create a new `VimeoUpload` initialized with a Blob or File and Vimeo Access Token then call `start()` to start the upload process.

```javascript

var options = {
    token:        "TOKEN_STRING_HERE",      //Required
    file:          null,                    //Required
    name:         "My awesome title",       //Optional
    description:  "My awesome description"  //Optional
}

var uploader = new VimeoUpload();
uploader.start(options);

```

### Advanced:

#### All default properties

List of options that can be overriden.

```
| Properties                | Description                                                                                                                                                               | Default                                                                | Required |
|---------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------|------------------------------------------------------------------------|----------|
| token                     | Authentication token created on Vimeo, must have an UPLOAD scope (to be able to upload), and an EDIT scope(to add meta data after upload is complete)                     | YOUR_TOKEN_HERE                                                        | Required |
| file                      | The File or Blog to upload.                                                                                                                                               | null                                                                   | Required |
| preferredUploadDuration   | The preferred chunk upload duration. The chunk size will be updated after each chunk upload to best fit the prefferedUploadDuration.                                      | 20 [seconds]                                                           | Optional |
| chunkSize                 | The size of the chunk to be uploaded                                                                                                                                      | 1024*1024                                                              | Optional |
| supportedFiles            | A list of supported file extensions.                                                                                                                                      | ["mov", "mpeg4", "mp4", "avi", "wmv", "mpegps", "flv", "3gpp", "webm"] | Optional |
| name                      | The name of the file                                                                                                                                                      | ""                                                                     | Optional |
| description               | The description of the file                                                                                                                                               | ""                                                                     | Optional |
| upgrade_to_1080           | Upgrade the video to 1080                                                                                                                                                 | false                                                                  | Optional |
| timeInterval              | Time interval for event data to be dispatched.                                                                                                                            | 150 [miliseconds]                                                      | Optional |
| maxAcceptedFails          | The number of failures that can occur before the upload is terminated. Fails occur whenever a request fails. Setting this to 0 will allow for unlimited amount of fails.  | 20                                                                     | Optional |
| maxAcceptedUploadDuration | If the maxAcceptedUploadDuration for a chunk is exceeded, the upload request is aborted and the chunkSize is updated before sending picking up where the upload was left. | 60 [seconds]                                                           | Optional |
| useDefaultFileName        | Use the file's default name as the video name.                                                                                                                            | false                                                                  | Optional |
| privacy                   | Sets the video's privacy to "nobody" if true, and to "anybody" if false.                                                                                                  | false                                                                  | Optional |
| retryTimeout              | The time before the upload process is resumed when a fail occurs.                                                                                                         | 5000 [miliseconds]                                                     | Optional |
```

##### Usage


```javascript

//All Default options that can be overriden
var options = {
    token:                    "TOKEN_STRING_HERE", //Required
    file:                     null, //Required
    preferredUploadDuration:  20,
    chunkSize:                1024*1024,
    supportedFiles:           ["mov", "mpeg4", "mp4", "avi", "wmv", "mpegps", "flv", "3gpp", "webm"],
    name:                     "",
    description:              "",
    upgrade_to_1080:          false,
    timeInterval:             150,
    maxAcceptedFails:         20,
    maxAcceptedUploadDuration: 60,
    useDefaultFileName:       false,
    privacy:                  false,
    retryTimeout:             5000
};

var uploader = new VimeoUpload();
uploader.start(options);

```

#### Event Usage

##### List:

VimeoUpload comes with different events that can be binded.

```
| Event Names          | Description                                             | Frequency     | [Object object] sent                                                                      |
|----------------------|---------------------------------------------------------|---------------|-------------------------------------------------------------------------------------------|
| chunkprogresschanged | Regularly sends the current percent of a chunk upload   | Default 150ms | { detail: number }                                                                        |
| totalprogresschanged | Regularly sends the current percent of the total upload | Default 150ms | { detail: number }                                                                        |
| error                | Emits if any errors occurs                              | N/A           | { detail: { message: string, error: [Object object] } }                                   |
| complete             | Called once when the upload is completed                | Once          | { detail: { id: number,  link: string, name: string, uri: string, createdTime: string } } |
```


##### Usage:
```javascript

    //Get the progress bar elements
    var totalProgress = document.getElementById("progress-total");
    var chunkProgress = document.getElementById("progress-chunk");

    //Create the VimeoUpload object
    var vimeoUpload = new VimeoUpload();

    vimeoUpload.on("chunkprogresschanged", function(event){
        var progress = event.detail;
        chunkProgress.setAttribute('style', 'width:' + progress + '%');
        chunkProgress.innerHTML = '&nbsp;' + progress + '%'

    });

    vimeoUpload.on("totalprogresschanged", function(event){
        var progress = event.detail;
        totalProgress.setAttribute('style', 'width:' + progress + '%');
        totalProgress.innerHTML = '&nbsp;' + progress + '%'
    });

    vimeoUpload.on("error", function(event){
        console.log(event.detail.message, event.detail.error);
    });

    vimeoUpload.on("complete", function(event){
        console.log("Meta data", event.detail);
    });

    //Start upload
    vimeoUpload.start(options);

```

Your access token need to be authorized by Vimeo. Ensure it has an "EDIT" and "UPLOAD" scope. Create new Vimeo access token [here](https://developer.vimeo.com/apps).

Check `index.html` for details and additional parameters you can include when initializing `VimeoUpload`.

## Credits

Sample code for uploading files directly with XHR/CORS: [cors-upload-sample](https://github.com/googledrive/cors-upload-sample)