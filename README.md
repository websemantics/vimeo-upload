```
  _   ___                  __  __     __             __
 | | / (_)_ _  ___ ___    / / / /__  / /__  ___ ____/ /
 | |/ / /  ' \/ -_) _ \  / /_/ / _ \/ / _ \/ _ `/ _  / 
 |___/_/_/_/_/\__/\___/  \____/ .__/_/\___/\_,_/\_,_/  
                             /_/ v1.1                      
Updated: 25 Feb 2016
```

Helper code for uploading video files directly with vanilla Javascript (XHR/CORS) to your Vimeo account. 

Try the [live version](http://websemantics.github.io/vimeo-upload/)
and drag & drop files to upload them to Vimeo.

## Usage

If you'd like to use the code in your own project, copy `upload.js` and include it.

    <script src="/path/to/upload.js"></script>
    
When uploading a file, create a new MediaUploader initialized with a Blob or File and Vimeo access token. Then call `upload()` to start the upload process.

    var uploader = new MediaUploader({
      file: content,
      token: accessToken,
    });
    uploader.upload();

Your access token need to be authorized by Vimeo.

See `upload.js` for additional parameters you can include when initializing the uploader, including callbacks for success & failure events.

This code has only been tested for uploading videos and monitoring progress.

# Change Log
All notable changes to this project will be documented in this section.

## [1.1] - 2016-02-25
### Changed
- Update video data after upload (name & description)
- Adding data chunking support for Cordova 

### [1.0] - 2015-01-14
#### Changed
- Upload videos
- Support for high-definition videos

## ToDo

Implement Pause / Resume

## Open Source Projects Used

- Sample code for uploading files directly with XHR/CORS: [cors-upload-sample](https://github.com/googledrive/cors-upload-sample)

