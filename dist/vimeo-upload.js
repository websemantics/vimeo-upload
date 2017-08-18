var VimeoUpload =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 6);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var request_1 = __webpack_require__(9);
var header_1 = __webpack_require__(10);
var response_1 = __webpack_require__(11);
var utils_1 = __webpack_require__(2);
var status_enum_1 = __webpack_require__(1);
/**
 * Created by kfaulhaber on 31/03/2017.
 */
var HttpService = (function () {
    /**
     * constructor
     * @param maxAcceptedUploadDuration
     */
    function HttpService(maxAcceptedUploadDuration) {
        this.maxAcceptedUploadDuration = maxAcceptedUploadDuration;
    }
    /**
     * DefaultResolver that decides if the xhr response is valid, and sends custom Response
     * @param xhr
     * @returns {Response}
     * @constructor
     */
    HttpService.DefaultResolver = function (xhr) {
        var data = null;
        try {
            data = JSON.parse(xhr.response);
        }
        catch (e) {
            data = xhr.response;
        }
        var response = new response_1.Response(xhr.status, xhr.statusText, data);
        response.responseHeaders = xhr.getAllResponseHeaders().split("\r\n").filter(function (rawHeader) {
            return rawHeader.length > 0;
        }).map(function (rawHeader) {
            var index = rawHeader.indexOf(":");
            return new header_1.Header(rawHeader.slice(0, index).trim(), rawHeader.slice(index + 1).trim());
        });
        if (xhr.status > 308) {
            response.statusCode = status_enum_1.Status.Rejected;
        }
        else {
            response.statusCode = status_enum_1.Status.Resolved;
        }
        return response;
    };
    /**
     * send method that sets the headers, the different callbacks and sends a request with data.
     * @param request
     * @param statData
     * @returns {Promise<T>}
     */
    HttpService.prototype.send = function (request, statData) {
        if (statData === void 0) { statData = null; }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(request.method, request.url, true);
            request.headers.forEach(function (header) { return xhr.setRequestHeader(header.title, header.value); });
            xhr.onload = function () {
                if (statData !== null) {
                    statData.end = new Date();
                    statData.done = true;
                }
                var response = HttpService.DefaultResolver(xhr);
                switch (true) {
                    case response.statusCode === status_enum_1.Status.Resolved:
                        resolve(response);
                        break;
                    default:
                        reject(response);
                }
            };
            xhr.onabort = function () {
                reject(new response_1.Response(xhr.status, xhr.statusText, xhr.response));
            };
            xhr.onerror = function () {
                reject(new response_1.Response(xhr.status, xhr.statusText, xhr.response));
            };
            if (statData != null) {
                xhr.upload.addEventListener("progress", function (data) {
                    if (data.lengthComputable) {
                        statData.loaded = data.loaded;
                        statData.total = data.total;
                        statData.end = new Date();
                        //TODO: Symplify this.
                        if (utils_1.TimeUtil.TimeToSeconds(statData.end.getTime() - statData.start.getTime()) > statData.prefferedDuration * 2) {
                            statData.loaded = 0;
                            statData.total = 0;
                            statData.done = true;
                            xhr.abort();
                        }
                    }
                });
            }
            try {
                xhr.send(request.data);
            }
            catch (e) {
                console.error("An error occured while sending.", e);
            }
        });
    };
    /**
     * Method that takes raw information to build a Request object.
     * @param method
     * @param url
     * @param data
     * @param headers
     * @returns {Request}
     * @constructor
     */
    HttpService.CreateRequest = function (method, url, data, headers) {
        if (data === void 0) { data = null; }
        if (headers === void 0) { headers = null; }
        var headerList = [];
        for (var prop in headers) {
            if (headers.hasOwnProperty(prop)) {
                headerList.push(new header_1.Header(prop, headers[prop]));
            }
        }
        return new request_1.Request(method, url, data, headerList);
    };
    return HttpService;
}());
exports.HttpService = HttpService;


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 26/07/2017.
 *
 * Status enum for setting the status of a custom Response
 *
 */
exports.__esModule = true;
var Status;
(function (Status) {
    Status[Status["Neutral"] = 0] = "Neutral";
    Status[Status["Rejected"] = 1] = "Rejected";
    Status[Status["Resolved"] = 2] = "Resolved";
})(Status = exports.Status || (exports.Status = {}));


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 17/07/2017.
 */
exports.__esModule = true;
var TimeUtil = (function () {
    function TimeUtil() {
    }
    /**
     * TimeToSeconds method that converts miliseconds to seconds
     * @param time
     * @returns {number}
     * @constructor
     */
    TimeUtil.TimeToSeconds = function (time) {
        return time / 1000;
    };
    /**
     * TimeToString method that takes a time and converts it to a string.
     * @param time
     * @returns {string}
     * @constructor
     */
    TimeUtil.TimeToString = function (time) {
        var date = new Date(null);
        date.setTime(time);
        return date.toISOString().substr(11, 8);
    };
    /**
     * MilisecondsToString method that converts miliseconds to a string time format. HH:MM:SS
     * @param miliseconds
     * @returns {string}
     * @constructor
     */
    TimeUtil.MilisecondsToString = function (miliseconds) {
        var seconds = TimeUtil.TimeToSeconds(miliseconds);
        var date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    };
    return TimeUtil;
}());
exports.TimeUtil = TimeUtil;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by Kfaulhaber on 30/06/2017.
 *
 * Basic route creater
 *
 */
exports.__esModule = true;
exports.VIMEO_ROUTES = {
    DEFAULT: function (uri) {
        if (uri === void 0) { uri = ""; }
        return "https://api.vimeo.com" + uri;
    },
    TICKET: function () { return exports.VIMEO_ROUTES.DEFAULT() + "/me/videos"; },
    VIDEOS: function (videoId) { return "" + exports.VIMEO_ROUTES.DEFAULT("/videos/" + videoId); }
};


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 13/07/2017.
 */
exports.__esModule = true;
exports.DEFAULT_VALUES = {
    preferredUploadDuration: 20,
    chunkSize: 1024 * 1024,
    token: "TOKEN_STRING_HERE",
    supportedFiles: ["mov", "mpeg4", "mp4", "avi", "wmv", "mpegps", "flv", "3gpp", "webm"],
    name: "",
    description: "",
    file: null,
    upgrade_to_1080: false,
    timeInterval: 150,
    maxAcceptedFails: 20,
    maxAcceptedUploadDuration: 60,
    useDefaultFileName: false,
    retryTimeout: 5000,
    videoData: {} //See link for a full list of supported metaData | https://developer.vimeo.com/api/endpoints/videos#PATCH/videos/{video_id}
};
exports.DEFAULT_EVENTS = {
    chunkprogresschanged: function (event) { return console.log("Default: Chunk Progress Update: " + event.detail + "/100"); },
    totalprogresschanged: function (event) { return console.log("Default: Total Progress Update: " + event.detail + "/100"); },
    vimeouploaderror: function () { },
    vimeouploadcomplete: function () { }
};


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var config_1 = __webpack_require__(4);
/**
 * Created by kfaulhaber on 17/07/2017.
 *
 * EventService class
 *
 * Composed of static methods for handly events
 *
 */
var EventService = (function () {
    function EventService() {
    }
    /**
     * Add static method that registers a valid event name.
     * @param eventName
     * @param callback
     * @constructor
     */
    EventService.Add = function (eventName, callback) {
        window.addEventListener(eventName, callback, false);
    };
    /**
     * Remove static method that unregisters a listener with a valid event name
     * @param eventName
     * @param callback
     * @constructor
     */
    EventService.Remove = function (eventName, callback) {
        window.removeEventListener(eventName, callback, false);
    };
    /**
     * Dispatch static method that emits an event
     * @param eventName
     * @param data
     * @constructor
     */
    EventService.Dispatch = function (eventName, data) {
        if (data === void 0) { data = null; }
        var customEvent = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(customEvent);
    };
    /**
     * Exists static method that checks if an event name is valid.
     * @param eventName
     * @returns {boolean}
     * @constructor
     */
    EventService.Exists = function (eventName) {
        return config_1.DEFAULT_EVENTS.hasOwnProperty(eventName);
    };
    /**
     * GetDefault static method that returns the default handler for a given event.
     * @param eventName
     * @returns {any}
     * @constructor
     */
    EventService.GetDefault = function (eventName) {
        return config_1.DEFAULT_EVENTS[eventName];
    };
    return EventService;
}());
exports.EventService = EventService;


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var app_1 = __webpack_require__(7);
var module;
/**
 * Created by kfaulhaber on 30/06/2017.
 */
/**
 * Binding library to exports
 * @type {App}
 */
module.exports = app_1.App;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var ticket_service_1 = __webpack_require__(8);
var chunk_service_1 = __webpack_require__(13);
var upload_service_1 = __webpack_require__(15);
var config_1 = __webpack_require__(4);
var event_service_1 = __webpack_require__(5);
var validator_service_1 = __webpack_require__(16);
var media_service_1 = __webpack_require__(17);
var http_service_1 = __webpack_require__(0);
var stat_service_1 = __webpack_require__(19);
var App = (function () {
    function App() {
        //Defining other properties
        this.failCount = 0;
    }
    /**
     * Method that initializes the VimeoUpload library. Called everytime an upload is started.
     * Resets all the services and properties. To see "config/config.ts" for all properties that can be added to options.
     * @param options
     */
    App.prototype.init = function (options) {
        if (options === void 0) { options = {}; }
        var values = {};
        //We loop through all the default values and see if options overides specific ones. All new properties are added to values object.
        for (var prop in config_1.DEFAULT_VALUES) {
            if (config_1.DEFAULT_VALUES.hasOwnProperty(prop)) {
                values[prop] = (options.hasOwnProperty(prop)) ? options[prop] : config_1.DEFAULT_VALUES[prop];
            }
        }
        this.maxAcceptedFails = values.maxAcceptedFails;
        this.httpService = new http_service_1.HttpService(values.maxAcceptedUploadDuration);
        this.mediaService = new media_service_1.MediaService(this.httpService, values.file, values.videoData, values.upgrade_to_1080, values.useDefaultFileName);
        this.chunkService = new chunk_service_1.ChunkService(this.mediaService, values.preferredUploadDuration, values.chunkSize);
        this.statService = new stat_service_1.StatService(values.timeInterval, this.chunkService);
        this.ticketService = new ticket_service_1.TicketService(values.token, this.httpService, values.upgrade_to_1080);
        this.uploadService = new upload_service_1.UploadService(this.mediaService, this.ticketService, this.httpService, this.statService);
        this.validatorService = new validator_service_1.ValidatorService(values.supportedFiles);
    };
    /**
     * Start method that'll initiate the upload, create the upload ticket and start the upload loop.
     * @param options
     */
    App.prototype.start = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.init(options);
        //TODO: Add error if not supported.
        if (!this.validatorService.isSupported(this.mediaService.media.file))
            return;
        this.ticketService.open()
            .then(function (response) {
            console.log(response);
            _this.ticketService.save(response);
            _this.statService.start();
            _this.process();
        })["catch"](function (error) {
            if (_this.canContinue()) {
                _this.failCount++;
                event_service_1.EventService.Dispatch("vimeouploaderror", { message: "Error creating ticket.", error: error });
                setTimeout(function () {
                    _this.start(options);
                }, _this.retryTimeout);
            }
        });
    };
    /**
     * Process method that will seek the next chunk to upload
     */
    App.prototype.process = function () {
        var _this = this;
        var chunk = this.chunkService.create();
        this.uploadService.send(chunk).then(function (response) {
            _this.chunkService.updateSize(_this.statService.getChunkUploadDuration());
            _this.check();
        })["catch"](function (error) {
            if (_this.canContinue()) {
                _this.failCount++;
                event_service_1.EventService.Dispatch("vimeouploaderror", { message: "Error sending chunk.", error: error });
                _this.chunkService.updateSize(_this.statService.getChunkUploadDuration());
                setTimeout(function () {
                    _this.check();
                }, _this.retryTimeout);
            }
        });
    };
    /**
     * Check method that is called after each chunk upload to update the byte range.
     */
    App.prototype.check = function () {
        var _this = this;
        this.uploadService.getRange().then(function (response) {
            switch (response.status) {
                case 308:
                    //noinspection TypeScriptValidateTypes
                    var range = response.responseHeaders.find(function (header) {
                        if (header === null && header === undefined)
                            return false;
                        return header.title === "Range";
                    });
                    _this.chunkService.updateOffset(range.value);
                    if (_this.chunkService.isDone()) {
                        _this.done();
                        return;
                    }
                    _this.process();
                    break;
                case 200 || 201:
                    _this.done();
                    break;
                default:
                    console.warn("Unrecognized status code (" + response.status + ") for chunk range.");
            }
        })["catch"](function (error) {
            event_service_1.EventService.Dispatch("vimeouploaderror", { message: "Unable to get range.", error: error });
            if (_this.canContinue()) {
                _this.failCount++;
                setTimeout(function () {
                    _this.check();
                }, _this.retryTimeout);
            }
        });
    };
    /**
     * Done method that is called when an upload has been completed. Closes the upload ticket.
     */
    App.prototype.done = function () {
        var _this = this;
        this.statService.totalStatData.done = true;
        this.ticketService.close().then(function (response) {
            _this.statService.stop();
            try {
                //noinspection TypeScriptValidateTypes
                var vimeoId = parseInt(response.responseHeaders.find(function (header) {
                    //noinspection TypeScriptValidateTypes
                    if (header === null && header === undefined)
                        return false;
                    return header.title === "Location";
                }).value.replace("/videos/", ""));
                _this.updateVideo(vimeoId);
            }
            catch (error) {
                console.log("Error retrieving Vimeo Id.");
            }
            console.log("Delete success:", response);
        })["catch"](function (error) {
            _this.statService.stop();
            event_service_1.EventService.Dispatch("vimeouploaderror", { message: "Unable to close upload ticket.", error: error });
        });
    };
    /**
     * UpdateVideo method
     * @param vimeoId
     */
    App.prototype.updateVideo = function (vimeoId) {
        this.mediaService.updateVideoData(this.ticketService.token, vimeoId).then(function (response) {
            var meta = media_service_1.MediaService.GetMeta(vimeoId, response.data);
            event_service_1.EventService.Dispatch("vimeouploadcomplete", meta);
        })["catch"](function (error) {
            event_service_1.EventService.Dispatch("vimeouploaderror", { message: "Unable to update video " + vimeoId + " with name and description.", error: error });
        });
    };
    /**
     * on method to add a listener. See config/config.ts for a list of available events
     * @param eventName
     * @param callback
     */
    App.prototype.on = function (eventName, callback) {
        if (callback === void 0) { callback = null; }
        if (!event_service_1.EventService.Exists(eventName))
            return;
        if (callback === null) {
            callback = event_service_1.EventService.GetDefault(eventName);
        }
        event_service_1.EventService.Add(eventName, callback);
    };
    /**
     * off method to remove a listener. See config/config.ts for a list of available events
     * @param eventName
     * @param callback
     */
    App.prototype.off = function (eventName, callback) {
        if (callback === void 0) { callback = null; }
        if (!event_service_1.EventService.Exists(eventName))
            return;
        if (callback === null) {
            callback = event_service_1.EventService.GetDefault(eventName);
        }
        event_service_1.EventService.Remove(eventName, callback);
    };
    /**
     * canContinue method checks to see if the amount of failCounts exceed the maxAcceptedFails
     * @returns {boolean}
     */
    App.prototype.canContinue = function () {
        return (this.maxAcceptedFails === 0) ? true : (this.failCount <= this.maxAcceptedFails) ? true : false;
    };
    return App;
}());
exports.App = App;


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var http_service_1 = __webpack_require__(0);
var ticket_1 = __webpack_require__(12);
var routes_1 = __webpack_require__(3);
/**
 * Created by kfaulhaber on 30/06/2017.
 */
var TicketService = (function () {
    /**
     * constructor that takes 3 paramaters
     * @param token
     * @param httpService
     * @param upgrade_to_1080
     */
    function TicketService(token, httpService, upgrade_to_1080) {
        this.token = token;
        this.httpService = httpService;
        this.upgrade_to_1080 = upgrade_to_1080;
    }
    /**
     * open method that creates a ticket request
     * @returns {Promise<T>}
     */
    TicketService.prototype.open = function () {
        var data = { type: 'streaming' };
        if (this.upgrade_to_1080) {
            data["upgrade_to_1080"] = this.upgrade_to_1080;
        }
        var request = http_service_1.HttpService.CreateRequest("POST", routes_1.VIMEO_ROUTES.TICKET(), JSON.stringify(data), {
            Authorization: "Bearer " + this.token,
            'Content-Type': 'application/json'
        });
        return this.httpService.send(request);
    };
    /**
     * save method that takes a response from creating a ticket upload request and saves it
     * @param response
     */
    TicketService.prototype.save = function (response) {
        this.ticket = new ticket_1.Ticket(response.data.upload_link_secure, response.data.ticket_id, response.data.upload_link, response.data.complete_uri, response.data.user);
    };
    /**
     * close method that sends a DELETE request to the ticket's complete Uri to complete and finalize the upload.
     * Called at the end of the upload when all the bytes have been sent.
     * @returns {Promise<T>}
     */
    TicketService.prototype.close = function () {
        var request = http_service_1.HttpService.CreateRequest("DELETE", routes_1.VIMEO_ROUTES.DEFAULT(this.ticket.completeUri), null, {
            Authorization: "Bearer " + this.token
        });
        return this.httpService.send(request);
    };
    return TicketService;
}());
exports.TicketService = TicketService;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
/**
 * Created by kfaulhaber on 17/07/2017.
 *
 * Custom Request Entity
 *
 */
var Request = (function () {
    function Request(method, url, data, headers) {
        if (data === void 0) { data = null; }
        if (headers === void 0) { headers = []; }
        this.method = method;
        this.url = url;
        this.data = data;
        this.headers = headers;
    }
    return Request;
}());
exports.Request = Request;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 24/07/2017.
 *
 * Header Class Entity
 */
exports.__esModule = true;
var Header = (function () {
    function Header(title, value) {
        this.title = title;
        this.value = value;
    }
    return Header;
}());
exports.Header = Header;


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var status_enum_1 = __webpack_require__(1);
/**
 * Created by kfaulhaber on 20/07/2017.
 *
 * Custom Response Entity
 *
 */
var Response = (function () {
    function Response(status, statusText, data) {
        if (data === void 0) { data = null; }
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        this.statusCode = status_enum_1.Status.Neutral;
    }
    return Response;
}());
exports.Response = Response;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 13/07/2017.
 *
 * Ticket Entity
 *
 */
exports.__esModule = true;
var Ticket = (function () {
    function Ticket(uploadLinkSecure, ticketId, uploadLink, completeUri, user) {
        this.uploadLinkSecure = uploadLinkSecure;
        this.ticketId = ticketId;
        this.uploadLink = uploadLink;
        this.completeUri = completeUri;
        this.user = user;
    }
    return Ticket;
}());
exports.Ticket = Ticket;


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var chunk_1 = __webpack_require__(14);
/**
 * Created by kfaulhaber on 30/06/2017.
 */
var ChunkService = (function () {
    /**
     * constructor
     * @param mediaService
     * @param preferredUploadDuration
     * @param size
     * @param offset
     */
    function ChunkService(mediaService, preferredUploadDuration, size, offset) {
        if (offset === void 0) { offset = 0; }
        this.mediaService = mediaService;
        this.preferredUploadDuration = preferredUploadDuration;
        this.size = size;
        this.offset = offset;
    }
    /**
     * updateSize method that updates the next chunk size based on the uploadDuration compares to the prefferedUploadDuration
     * @param uploadDuration
     */
    ChunkService.prototype.updateSize = function (uploadDuration) {
        this.size = Math.floor((this.size * this.preferredUploadDuration) / uploadDuration * ChunkService.Adjuster);
    };
    /**
     * create method that returns the next chunk to upload from the byte array
     * @returns {Chunk}
     */
    ChunkService.prototype.create = function () {
        var end = Math.min(this.offset + this.size, this.mediaService.media.file.size);
        //TODO: Simplify
        if (end - this.offset !== this.size) {
            this.updateSize(end - this.offset);
        }
        var content = this.mediaService.media.file.slice(this.offset, end);
        return new chunk_1.Chunk(content, "bytes " + this.offset + "-" + end + "/" + this.mediaService.media.file.size);
    };
    /**
     * updateOffset method that takes a range and updates the offset.
     * @param range
     */
    ChunkService.prototype.updateOffset = function (range) {
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    };
    /**
     * isDone method that checks to see if the offset is or is superior to the file size.
     * @returns {boolean}
     */
    ChunkService.prototype.isDone = function () {
        return this.offset >= this.mediaService.media.file.size;
    };
    ChunkService.Adjuster = 0.7;
    return ChunkService;
}());
exports.ChunkService = ChunkService;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 13/07/2017.
 *
 * Chunk Entity
 *
 */
exports.__esModule = true;
var Chunk = (function () {
    function Chunk(content, contentRange) {
        this.content = content;
        this.contentRange = contentRange;
    }
    return Chunk;
}());
exports.Chunk = Chunk;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var http_service_1 = __webpack_require__(0);
/**
 * Created by kfaulhaber on 30/06/2017.
 */
var UploadService = (function () {
    /**
     * constructor that has mulitple dependencies to other services
     * @param mediaService
     * @param ticketService
     * @param httpService
     * @param statService
     */
    function UploadService(mediaService, ticketService, httpService, statService) {
        this.mediaService = mediaService;
        this.ticketService = ticketService;
        this.httpService = httpService;
        this.statService = statService;
    }
    /**
     * Method that sends a request with the video chunk data
     * @param chunk
     * @returns {Promise<T>}
     */
    UploadService.prototype.send = function (chunk) {
        var statData = this.statService.create();
        this.statService.save(statData);
        var request = http_service_1.HttpService.CreateRequest("PUT", this.ticketService.ticket.uploadLinkSecure, chunk.content, {
            'Content-Type': this.mediaService.media.file.type,
            'Content-Range': chunk.contentRange
        });
        return this.httpService.send(request, statData);
    };
    /**
     * getRange method that gets the byte range of the already uploaded video content
     * @returns {Promise<T>}
     */
    UploadService.prototype.getRange = function () {
        var request = http_service_1.HttpService.CreateRequest("PUT", this.ticketService.ticket.uploadLinkSecure, null, {
            'Content-Type': this.mediaService.media.file.type,
            'Content-Range': 'bytes */* '
        });
        return this.httpService.send(request);
    };
    return UploadService;
}());
exports.UploadService = UploadService;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 30/06/2017.
 */
exports.__esModule = true;
var ValidatorService = (function () {
    /**
     * constructor that takes in a list of supported video files
     * @param supportedFiles
     */
    function ValidatorService(supportedFiles) {
        this.supportedFiles = supportedFiles;
    }
    /**
     * Method that takes a file and decides whether it's supported
     * @param file
     * @returns {boolean}
     */
    ValidatorService.prototype.isSupported = function (file) {
        var type = file.type;
        if (type.indexOf('/') === -1) {
            console.warn("Wrong type found (" + type + ").");
            return false;
        }
        var split = type.split('/');
        if (split[0] !== "video") {
            console.warn("Only videos are supported, " + type + " given.");
            return false;
        }
        return this.supportedFiles.includes(split[1]);
    };
    return ValidatorService;
}());
exports.ValidatorService = ValidatorService;


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var media_1 = __webpack_require__(18);
var http_service_1 = __webpack_require__(0);
var routes_1 = __webpack_require__(3);
/**
 * Created by kfaulhaber on 21/07/2017.
 */
var MediaService = (function () {
    /**
     * constructor that initiates the services with the list of dependencies
     * @param httpService
     * @param file
     * @param data
     * @param upgrade_to_1080
     * @param useDefaultFileName
     */
    function MediaService(httpService, file, data, upgrade_to_1080, useDefaultFileName) {
        this.httpService = httpService;
        if (useDefaultFileName) {
            data["name"] = file.name;
        }
        this.media = new media_1.Media(file, data, upgrade_to_1080);
    }
    /**
     * updateVideoData method that sends a request to edit video information.
     * Will not work if the token does not have the "EDIT" scope. Will return a 403 forbidden.
     * @param {string} token
     * @param {number} vimeoId
     * @returns {Promise<T>}
     */
    MediaService.prototype.updateVideoData = function (token, vimeoId) {
        var params = this.media.data;
        var query = Object.keys(params).map(function (key) { return encodeURIComponent(key) + "=" + encodeURIComponent(params[key]); }).join('&');
        console.log(query);
        var request = http_service_1.HttpService.CreateRequest("PATCH", routes_1.VIMEO_ROUTES.VIDEOS(vimeoId), query, {
            Authorization: "Bearer " + token
        });
        return this.httpService.send(request);
    };
    /**
     * GetMeta static method returns an object with data from updateVideoData response
     * @param {number} vimeoId
     * @param {object} data
     * @returns {{id: number, link: (any|HTMLLinkElement|(function(string): string)), name: any, uri: any, createdTime: any}}
     */
    MediaService.GetMeta = function (vimeoId, data) {
        return {
            id: vimeoId,
            link: data.link,
            name: data.name,
            uri: data.uri,
            createdTime: data.created_time
        };
    };
    return MediaService;
}());
exports.MediaService = MediaService;


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 20/07/2017.
 */
exports.__esModule = true;
var Media = (function () {
    /**
     * constructor
     * @param file
     * @param data
     * @param upgrade_to_1080
     */
    function Media(file, data, upgrade_to_1080) {
        this.file = file;
        this.data = data;
        this.upgrade_to_1080 = upgrade_to_1080;
    }
    return Media;
}());
exports.Media = Media;


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var event_service_1 = __webpack_require__(5);
var utils_1 = __webpack_require__(2);
var stat_data_1 = __webpack_require__(20);
/**
 * Created by Grimbode on 14/07/2017.
 *
 * Service that takes care of checking the total uploaded content and dispatches events to notify all listeners.
 *
 */
var StatService = (function () {
    /**
     * constructor that takes two dependencies timerInterval and chunkService
     * @param timeInterval
     * @param chunkService
     */
    function StatService(timeInterval, chunkService) {
        this.timeInterval = timeInterval;
        this.chunkService = chunkService;
        this.si = -1;
        this.previousTotalPercent = 0;
    }
    /**
     * start method that starts the interval loop to constantly dispatch events with updated information.
     */
    StatService.prototype.start = function () {
        this.totalStatData = this.create(true);
        this.startInterval();
    };
    /**
     * create method creates a new statData with information from  chunkservice.
     * @param isTotal
     * @returns {StatData}
     */
    StatService.prototype.create = function (isTotal) {
        if (isTotal === void 0) { isTotal = false; }
        var date = new Date();
        var size = (isTotal) ? this.chunkService.mediaService.media.file.size : this.chunkService.size;
        var statData = new stat_data_1.StatData(date, date, this.chunkService.preferredUploadDuration, 0, size);
        return statData;
    };
    /**
     * save method that takes a statData and saves it to the chunkStatData
     * @param timeData
     */
    StatService.prototype.save = function (timeData) {
        this.chunkStatData = timeData;
    };
    /**
     * calculateRatio method that calculates the decimal percent of how much has been uploaded (can be chunk or total)
     * @param loaded
     * @param total
     * @returns {number}
     */
    StatService.prototype.calculateRatio = function (loaded, total) {
        return loaded / total;
    };
    /**
     * calculatePercent method calculates the percent that has been uploaded.
     * @param loaded
     * @param total
     * @returns {number}
     */
    StatService.prototype.calculatePercent = function (loaded, total) {
        return Math.floor(this.calculateRatio(loaded, total) * 100);
    };
    /**
     * updateTotal method that updates the total percent that has currently been uploaded.
     */
    StatService.prototype.updateTotal = function () {
        this.totalStatData.loaded += this.chunkStatData.total;
    };
    /**
     * startInterval method that starts the interval loop to continously dispatch events with updated information on what has been uploaded.
     */
    StatService.prototype.startInterval = function () {
        var _this = this;
        if (this.si > -1) {
            this.stop();
        }
        this.si = setInterval(function () {
            var chunkPercent = _this.calculatePercent(_this.chunkStatData.loaded, _this.chunkStatData.total);
            if (_this.chunkStatData.done) {
                _this.updateTotal();
                _this.chunkStatData.total = _this.chunkStatData.loaded = 0;
                chunkPercent = 100;
            }
            _this.totalStatData.loaded = Math.max(_this.chunkService.offset, _this.totalStatData.loaded);
            _this.totalStatData.end = _this.chunkStatData.end;
            _this.previousTotalPercent = Math.max(_this.totalStatData.loaded + _this.chunkStatData.loaded, _this.previousTotalPercent);
            var totalPercent = _this.calculatePercent(_this.previousTotalPercent, _this.totalStatData.total);
            event_service_1.EventService.Dispatch("chunkprogresschanged", chunkPercent);
            if (_this.totalStatData.done) {
                totalPercent = 100;
            }
            event_service_1.EventService.Dispatch("totalprogresschanged", totalPercent);
        }, this.timeInterval);
    };
    /**
     * stop method that stops the interval loop, which will stop the flow of dispatched events.
     */
    StatService.prototype.stop = function () {
        clearInterval(this.si);
    };
    /**
     * getChunkUploadDuration method that returns the current time it has taken to upload a chunk.
     * @returns {number}
     */
    StatService.prototype.getChunkUploadDuration = function () {
        return utils_1.TimeUtil.TimeToSeconds(this.chunkStatData.end.getTime() - this.chunkStatData.start.getTime());
    };
    /**
     * chunkIsOverPrefferedUploadTime method that checks if the duration time has exceeded the preffered upload duration.
     * @returns {boolean}
     */
    StatService.prototype.chunkIsOverPrefferedUploadTime = function () {
        return this.getChunkUploadDuration() >= this.chunkService.preferredUploadDuration * 1.5;
    };
    return StatService;
}());
exports.StatService = StatService;


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 24/07/2017.
 *
 * StatData Entity
 *
 */
exports.__esModule = true;
var StatData = (function () {
    function StatData(start, end, prefferedDuration, loaded, total, done) {
        if (loaded === void 0) { loaded = 0; }
        if (total === void 0) { total = 0; }
        if (done === void 0) { done = false; }
        this.start = start;
        this.end = end;
        this.prefferedDuration = prefferedDuration;
        this.loaded = loaded;
        this.total = total;
        this.done = done;
    }
    return StatData;
}());
exports.StatData = StatData;


/***/ })
/******/ ]);
//# sourceMappingURL=vimeo-upload.js.map