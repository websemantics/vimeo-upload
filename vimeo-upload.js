/*
 | Vimeo-Upload: Upload videos to your Vimeo account directly from a
 |               browser or a Node.js app
 |
 |  ╭───╮╭─╮  
 |  │   ││ │╭─╮╭──┬──┬─╮╭───╮╭───╮   
 |  │   ││ │├─┤│ ╭╮ ╭╮ ││ ─ ││╭╮ │  ╭────────┬─────────────────────╮
 |  ╰╮  ╰╯╭╯│ ││ ││ ││ ││  ─┤│╰╯ │  | UPLOAD │ ▒▒▒▒▒▒▒▒▒▒▒░░░░ %75 | 
 |   ╰────╯ ╰─╯╰─╯╰─╯╰─╯╰───╯╰───╯  ╰────────┴─────────────────────╯                    
 |
 |
 | This project was released under Apache 2.0" license.
 |
 | @link      http://websemantics.ca
 | @author    Web Semantics, Inc. Dev Team <team@websemantics.ca>
 | @author    Adnan M.Sagar, PhD. <adnan@websemantics.ca>
 | @credits   Built on cors-upload-sample, https://github.com/googledrive/cors-upload-sample
 */

;
(function(root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], function() {
            return (root.VimeoUpload = factory())
        })
    } else if (typeof module === 'object' && module.exports) {
        module.exports = factory()
    } else {
        root.VimeoUpload = factory()
    }
}(this, function() {

    // -------------------------------------------------------------------------
    // RetryHandler Class

    /**
     * Helper for implementing retries with backoff. Initial retry
     * delay is 1 second, increasing by 2x (+jitter) for subsequent retries
     *
     * @constructor
     */
    var RetryHandler = function() {
        this.interval = 1000 // Start at one second
        this.maxInterval = 60 * 1000; // Don't wait longer than a minute
    }

    /**
     * Invoke the function after waiting
     *
     * @param {function} fn Function to invoke
     */
    RetryHandler.prototype.retry = function(fn) {
        setTimeout(fn, this.interval)
        this.interval = this.nextInterval_()
    }

    /**
     * Reset the counter (e.g. after successful request)
     */
    RetryHandler.prototype.reset = function() {
        this.interval = 1000
    }

    /**
     * Calculate the next wait time.
     * @return {number} Next wait interval, in milliseconds
     *
     * @private
     */
    RetryHandler.prototype.nextInterval_ = function() {
        var interval = this.interval * 2 + this.getRandomInt_(0, 1000)
        return Math.min(interval, this.maxInterval)
    }

    /**
     * Get a random int in the range of min to max. Used to add jitter to wait times.
     *
     * @param {number} min Lower bounds
     * @param {number} max Upper bounds
     * @private
     */
    RetryHandler.prototype.getRandomInt_ = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min)
    }

    // -------------------------------------------------------------------------
    // Private data

    /* Library defaults, can be changed using the 'defaults' member method,

    - api_url (string), vimeo api url
    - name (string), default video name
    - description (string), default video description
    - contentType (string), video content type
    - token (string), vimeo api token
    - file (object), video file
    - metadata (array), data to associate with the video
    - upgrade_to_1080 (boolean), set video resolution to high definition
    - offset (int),
    - chunkSize (int),
    - retryHandler (RetryHandler), hanlder class
    - onComplete (function), handler for onComplete event
    - onProgress (function), handler for onProgress event
    - onError (function), handler for onError event

    */

    var defaults = {
        api_url: 'https://api.vimeo.com',
        name: 'Default name',
        description: 'Default description',
        contentType: 'application/octet-stream',
        token: null,
        file: {},
        metadata: [],
        upgrade_to_1080: false,
        offset: 0,
        chunkSize: 0,
        retryHandler: new RetryHandler(),
        onComplete: function() {},
        onProgress: function() {},
        onError: function() {}
    }

    /**
     * Helper class for resumable uploads using XHR/CORS. Can upload any Blob-like item, whether
     * files or in-memory constructs.
     *
     * @example
     * var content = new Blob(["Hello world"], {"type": "text/plain"})
     * var uploader = new VimeoUpload({
     *   file: content,
     *   token: accessToken,
     *   onComplete: function(data) { ... }
     *   onError: function(data) { ... }
     * })
     * uploader.upload()
     *
     * @constructor
     * @param {object} options Hash of options
     * @param {string} options.token Access token
     * @param {blob} options.file Blob-like item to upload
     * @param {string} [options.fileId] ID of file if replacing
     * @param {object} [options.params] Additional query parameters
     * @param {string} [options.contentType] Content-type, if overriding the type of the blob.
     * @param {object} [options.metadata] File metadata
     * @param {function} [options.onComplete] Callback for when upload is complete
     * @param {function} [options.onProgress] Callback for status for the in-progress upload
     * @param {function} [options.onError] Callback if upload fails
     */
    var me = function(opts) {

        /* copy user options or use default values */
        for (var i in defaults) {
            this[i] = (opts[i] !== undefined) ? opts[i] : defaults[i]
        }

        this.contentType = opts.contentType || this.file.type || defaults.contentType
        this.httpMethod = opts.fileId ? 'PUT' : 'POST'

        this.videoData = {
            name: (opts.name > '') ? opts.name : defaults.name,
            description: (opts.description > '') ? opts.description : defaults.description,
            'privacy.view': opts.private ? 'nobody' : 'anybody'
        }

        if (!(this.url = opts.url)) {
            var params = opts.params || {} /*  TODO params.uploadType = 'resumable' */
            this.url = this.buildUrl_(opts.fileId, params, opts.baseUrl)
        }
    }

    // -------------------------------------------------------------------------
    // Public methods

    /*
      Override class defaults

        Parameters:
        - opts (object): name value pairs

    */

    me.prototype.defaults = function(opts) {
        return defaults /* TODO $.extend(true, defaults, opts) */
    }

    /**
     * Initiate the upload (Get vimeo ticket number and upload url)
     */
    me.prototype.upload = function() {
        var xhr = new XMLHttpRequest()
        xhr.open(this.httpMethod, this.url, true)
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.token)
        xhr.setRequestHeader('Content-Type', 'application/json')

        xhr.onload = function(e) {
            // get vimeo upload  url, user (for available quote), ticket id and complete url
            if (e.target.status < 400) {
                var response = JSON.parse(e.target.responseText)
                this.url = response.upload_link_secure
                this.user = response.user
                this.ticket_id = response.ticket_id
                this.complete_url = defaults.api_url + response.complete_uri
                this.sendFile_()
            } else {
                this.onUploadError_(e)
            }
        }.bind(this)

        xhr.onerror = this.onUploadError_.bind(this)
        xhr.send(JSON.stringify({
            type: 'streaming',
            upgrade_to_1080: this.upgrade_to_1080
        }))
    }

    // -------------------------------------------------------------------------
    // Private methods

    /**
     * Send the actual file content.
     *
     * @private
     */
    me.prototype.sendFile_ = function() {
        var content = this.file
        var end = this.file.size

        if (this.offset || this.chunkSize) {
            // Only bother to slice the file if we're either resuming or uploading in chunks
            if (this.chunkSize) {
                end = Math.min(this.offset + this.chunkSize, this.file.size)
            }
            content = content.slice(this.offset, end)
        }

        var xhr = new XMLHttpRequest()
        xhr.open('PUT', this.url, true)
        xhr.setRequestHeader('Content-Type', this.contentType)
            // xhr.setRequestHeader('Content-Length', this.file.size)
        xhr.setRequestHeader('Content-Range', 'bytes ' + this.offset + '-' + (end - 1) + '/' + this.file.size)

        if (xhr.upload) {
            xhr.upload.addEventListener('progress', this.onProgress)
        }
        xhr.onload = this.onContentUploadSuccess_.bind(this)
        xhr.onerror = this.onContentUploadError_.bind(this)
        xhr.send(content)
    }

    /**
     * Query for the state of the file for resumption.
     *
     * @private
     */
    me.prototype.resume_ = function() {
        var xhr = new XMLHttpRequest()
        xhr.open('PUT', this.url, true)
        xhr.setRequestHeader('Content-Range', 'bytes */' + this.file.size)
        xhr.setRequestHeader('X-Upload-Content-Type', this.file.type)
        if (xhr.upload) {
            xhr.upload.addEventListener('progress', this.onProgress)
        }
        xhr.onload = this.onContentUploadSuccess_.bind(this)
        xhr.onerror = this.onContentUploadError_.bind(this)
        xhr.send()
    }

    /**
     * Extract the last saved range if available in the request.
     *
     * @param {XMLHttpRequest} xhr Request object
     */
    me.prototype.extractRange_ = function(xhr) {
        var range = xhr.getResponseHeader('Range')
        if (range) {
            this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1
        }
    }

    /**
     * The final step is to call vimeo.videos.upload.complete to queue up
     * the video for transcoding.
     *
     * If successful call 'onUpdateVideoData_'
     *
     * @private
     */
    me.prototype.complete_ = function(xhr) {
        var xhr = new XMLHttpRequest()
        xhr.open('DELETE', this.complete_url, true)
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.token)

        xhr.onload = function(e) {

            // Get the video location (videoId)
            if (e.target.status < 400) {
                var location = e.target.getResponseHeader('Location')

                // Example of location: ' /videos/115365719', extract the video id only
                var video_id = location.split('/').pop()
                    // Update the video metadata
                this.onUpdateVideoData_(video_id)
            } else {
                this.onCompleteError_(e)
            }
        }.bind(this)

        xhr.onerror = this.onCompleteError_.bind(this)
        xhr.send()
    }

    /**
     * Update the Video Data and add the metadata to the upload object
     *
     * @private
     * @param {string} [id] Video Id
     */
    me.prototype.onUpdateVideoData_ = function(video_id) {
        var url = this.buildUrl_(video_id, [], defaults.api_url + '/videos/')
        var httpMethod = 'PATCH'
        var xhr = new XMLHttpRequest()

        xhr.open(httpMethod, url, true)
        xhr.setRequestHeader('Authorization', 'Bearer ' + this.token)
        xhr.onload = function(e) {
            // add the metadata
            this.onGetMetadata_(e, video_id)
        }.bind(this)
        xhr.send(this.buildQuery_(this.videoData))
    }

    /**
     * Retrieve the metadata from a successful onUpdateVideoData_ response
     * This is is useful when uploading unlisted videos as the URI has changed.
     *
     * If successful call 'onUpdateVideoData_'
     *
     * @private
     * @param {object} e XHR event
     * @param {string} [id] Video Id
     */
    me.prototype.onGetMetadata_ = function(e, video_id) {
        // Get the video location (videoId)
        if (e.target.status < 400) {
            if (e.target.response) {
                // add the returned metadata to the metadata array
                var meta = JSON.parse(e.target.response)
                    // get the new index of the item
                var index = this.metadata.push(meta) - 1
                    // call the complete method
                this.onComplete(video_id, index)
            } else {
                this.onCompleteError_(e)
            }
        }
    }

    /**
     * Handle successful responses for uploads. Depending on the context,
     * may continue with uploading the next chunk of the file or, if complete,
     * invokes vimeo complete service.
     *
     * @private
     * @param {object} e XHR event
     */
    me.prototype.onContentUploadSuccess_ = function(e) {
        if (e.target.status == 200 || e.target.status == 201) {
            this.complete_()
        } else if (e.target.status == 308) {
            this.extractRange_(e.target)
            this.retryHandler.reset()
            this.sendFile_()
        }
    }

    /**
     * Handles errors for uploads. Either retries or aborts depending
     * on the error.
     *
     * @private
     * @param {object} e XHR event
     */
    me.prototype.onContentUploadError_ = function(e) {
        if (e.target.status && e.target.status < 500) {
            this.onError(e.target.response)
        } else {
            this.retryHandler.retry(this.resume_())
        }
    }

    /**
     * Handles errors for the complete request.
     *
     * @private
     * @param {object} e XHR event
     */
    me.prototype.onCompleteError_ = function(e) {
        this.onError(e.target.response); // TODO - Retries for initial upload
    }

    /**
     * Handles errors for the initial request.
     *
     * @private
     * @param {object} e XHR event
     */
    me.prototype.onUploadError_ = function(e) {
        this.onError(e.target.response); // TODO - Retries for initial upload
    }

    /**
     * Construct a query string from a hash/object
     *
     * @private
     * @param {object} [params] Key/value pairs for query string
     * @return {string} query string
     */
    me.prototype.buildQuery_ = function(params) {
        params = params || {}
        return Object.keys(params).map(function(key) {
            return encodeURIComponent(key) + '=' + encodeURIComponent(params[key])
        }).join('&')
    }

    /**
     * Build the drive upload URL
     *
     * @private
     * @param {string} [id] File ID if replacing
     * @param {object} [params] Query parameters
     * @return {string} URL
     */
    me.prototype.buildUrl_ = function(id, params, baseUrl) {
        var url = baseUrl || defaults.api_url + '/me/videos'
        if (id) {
            url += id
        }
        var query = this.buildQuery_(params)
        if (query) {
            url += '?' + query
        }
        return url
    }

    return me
}))
