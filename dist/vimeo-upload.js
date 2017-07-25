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
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
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
/******/ 	return __webpack_require__(__webpack_require__.s = 11);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var request_1 = __webpack_require__(7);
var header_1 = __webpack_require__(5);
var response_1 = __webpack_require__(8);
/**
 * Created by kfaulhaber on 31/03/2017.
 */
var HttpService = (function () {
    function HttpService(statService) {
        this.statService = statService;
    }
    HttpService.prototype.send = function (request, emitProgress) {
        var _this = this;
        if (emitProgress === void 0) { emitProgress = false; }
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            var statData = _this.statService.create();
            xhr.open(request.method, request.url, true);
            request.headers.forEach(function (header) { return xhr.setRequestHeader(header.title, header.value); });
            window.addEventListener("uploadaborted", function () {
                xhr.abort();
            }, false);
            xhr.onload = function () {
                var end = new Date();
                statData.end = end;
                statData.done = true;
                var data = null;
                try {
                    data = JSON.parse(xhr.response);
                }
                catch (e) {
                    data = xhr.response;
                }
                var response = new response_1.Response(xhr.status, xhr.statusText, data);
                switch (true) {
                    case xhr.status >= 200 && xhr.status < 300:
                        resolve(response);
                        break;
                    case xhr.status === 308:
                        response.range = xhr.getResponseHeader("Range");
                        resolve(response);
                        break;
                    default:
                        reject(response);
                }
            };
            xhr.onerror = function () {
                reject(new response_1.Response(xhr.status, xhr.statusText, xhr.response || null));
            };
            if (emitProgress) {
                _this.statService.save(statData);
                xhr.upload.addEventListener("progress", function (data) {
                    if (data.lengthComputable) {
                        statData.loaded = data.loaded;
                        statData.total = data.total;
                        statData.end = new Date();
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
    timeInterval: 150
};
exports.DEFAULT_EVENTS = {
    chunkprogresschanged: function (event) { return console.log("Default: Chunk Progress Update: " + event.detail + "/100"); },
    totalprogresschanged: function (event) { return console.log("Default: Total Progress Update: " + event.detail + "/100"); },
    estimatedtimechanged: function (event) { return console.log("Default: Estimated Time Update: " + event.detail); },
    estimatedchunktimechanged: function (event) { return console.log("Default: Estimated Chunk Time Update: " + event.detail); },
    estimateduploadspeedchanged: function (event) { return console.log("Default: Estimated Upload Speed Changed: " + event.detail + " mb/s"); },
    uploadaborted: function (event) { return console.log("Default: Upload aborted detected."); }
};


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var config_1 = __webpack_require__(1);
/**
 * Created by kfaulhaber on 17/07/2017.
 */
var EventService = (function () {
    function EventService() {
    }
    EventService.Add = function (eventName, callback) {
        window.addEventListener(eventName, callback, false);
    };
    EventService.Remove = function (eventName, callback) {
        window.removeEventListener(eventName, callback, false);
    };
    EventService.Dispatch = function (eventName, data) {
        if (data === void 0) { data = null; }
        var customEvent = new CustomEvent(eventName, { detail: data });
        window.dispatchEvent(customEvent);
    };
    EventService.Exists = function (eventName) {
        return config_1.DEFAULT_EVENTS.hasOwnProperty(eventName);
    };
    EventService.GetDefault = function (eventName) {
        return config_1.DEFAULT_EVENTS[eventName];
    };
    return EventService;
}());
exports.EventService = EventService;


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var ticket_service_1 = __webpack_require__(16);
var chunk_service_1 = __webpack_require__(13);
var upload_service_1 = __webpack_require__(17);
var config_1 = __webpack_require__(1);
var event_service_1 = __webpack_require__(2);
var validator_service_1 = __webpack_require__(18);
var media_service_1 = __webpack_require__(14);
var http_service_1 = __webpack_require__(0);
var stat_service_1 = __webpack_require__(15);
/**
 * Created by Grimbode on 12/07/2017.
 */
var App = (function () {
    function App(options) {
        if (options === void 0) { options = {}; }
        for (var prop in options) {
            if (!options.hasOwnProperty(prop)) {
                continue;
            }
            switch (true) {
                case config_1.DEFAULT_VALUES.hasOwnProperty(prop):
                    config_1.DEFAULT_VALUES[prop] = options[prop];
                    break;
                default:
                    console.warn("Unrecognized property: " + prop);
            }
        }
        this.mediaService = new media_service_1.MediaService(config_1.DEFAULT_VALUES);
        this.chunkService = new chunk_service_1.ChunkService(this.mediaService, config_1.DEFAULT_VALUES.preferredUploadDuration, config_1.DEFAULT_VALUES.chunkSize);
        this.statService = new stat_service_1.StatService(config_1.DEFAULT_VALUES.timeInterval, this.chunkService);
        this.httpService = new http_service_1.HttpService(this.statService);
        this.ticketService = new ticket_service_1.TicketService(config_1.DEFAULT_VALUES.token, this.httpService);
        this.uploadService = new upload_service_1.UploadService(this.mediaService, this.ticketService, this.httpService);
        this.validatorService = new validator_service_1.ValidatorService(config_1.DEFAULT_VALUES.supportedFiles);
    }
    App.prototype.start = function (options) {
        var _this = this;
        if (options === void 0) { options = {}; }
        this.mediaService.setData(options);
        if (options.token) {
            this.ticketService.token = config_1.DEFAULT_VALUES.token = options.token;
        }
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
            console.log("Error occured while generating ticket. " + error);
        });
    };
    App.prototype.process = function () {
        var _this = this;
        console.log("Processing");
        var chunk = this.chunkService.create();
        console.log(chunk.content, chunk.contentRange);
        this.uploadService.send(chunk).then(function (response) {
            _this.chunkService.updateSize(_this.statService.getChunkUploadDuration());
            _this.check();
        })["catch"](function (error) {
            console.error("Error sending chunk", error);
        });
    };
    App.prototype.check = function () {
        var _this = this;
        this.uploadService.getRange().then(function (response) {
            switch (response.status) {
                case 308:
                    console.log("New range " + response.range);
                    _this.chunkService.updateOffset(response.range);
                    if (_this.chunkService.isDone()) {
                        _this.done();
                        return;
                    }
                    _this.process();
                    break;
                case 200 || 201:
                    _this.ticketService.close().then(function (response) {
                        console.log(response);
                    })["catch"](function (error) {
                        console.log(error);
                    });
                    break;
                default:
                    console.warn("Unrecognized status code (" + response.status + ") for chunk range.");
            }
        })["catch"](function (error) {
            console.error("Error getting chunk range", error);
        });
    };
    //TODO: find a way to reset
    App.prototype.done = function () {
        var _this = this;
        this.statService.totalStatData.done = true;
        this.ticketService.close().then(function (response) {
            _this.statService.stop();
            console.log("Delete success:", response);
        })["catch"](function (error) {
            _this.statService.stop();
            console.warn("Delete failed:", error);
        });
    };
    App.prototype.abort = function () {
        event_service_1.EventService.Dispatch("uploadaborted");
        this.done();
    };
    App.prototype.on = function (eventName, callback) {
        if (callback === void 0) { callback = null; }
        if (!event_service_1.EventService.Exists(eventName))
            return;
        if (callback === null) {
            callback = event_service_1.EventService.GetDefault(eventName);
        }
        event_service_1.EventService.Add(eventName, callback);
    };
    App.prototype.off = function (eventName, callback) {
        if (callback === void 0) { callback = null; }
        if (!event_service_1.EventService.Exists(eventName))
            return;
        if (callback === null) {
            callback = event_service_1.EventService.GetDefault(eventName);
        }
        event_service_1.EventService.Remove(eventName, callback);
    };
    return App;
}());
exports.App = App;


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 13/07/2017.
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
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 24/07/2017.
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 20/07/2017.
 */
exports.__esModule = true;
var Media = (function () {
    //TODO: Check to see if these default values are acceptable
    function Media(name, description, file, upgrade_to_1080) {
        if (name === void 0) { name = ""; }
        if (description === void 0) { description = ""; }
        if (file === void 0) { file = null; }
        if (upgrade_to_1080 === void 0) { upgrade_to_1080 = false; }
        this.name = name;
        this.description = description;
        this.file = file;
        this.upgrade_to_1080 = upgrade_to_1080;
    }
    return Media;
}());
exports.Media = Media;


/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
/**
 * Created by kfaulhaber on 17/07/2017.
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
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 20/07/2017.
 */
exports.__esModule = true;
var Response = (function () {
    function Response(status, statusText, data) {
        if (data === void 0) { data = null; }
        this.status = status;
        this.statusText = statusText;
        this.data = data;
        this.range = null;
        this.duration = -1;
    }
    return Response;
}());
exports.Response = Response;


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 24/07/2017.
 */
exports.__esModule = true;
var StatData = (function () {
    function StatData(start, end, loaded, total, done) {
        if (loaded === void 0) { loaded = 0; }
        if (total === void 0) { total = 0; }
        if (done === void 0) { done = false; }
        this.start = start;
        this.end = end;
        this.loaded = loaded;
        this.total = total;
        this.done = done;
    }
    return StatData;
}());
exports.StatData = StatData;


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 13/07/2017.
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var app_1 = __webpack_require__(3);
var module;
/**
 * Created by kfaulhaber on 30/06/2017.
 */
module.exports = app_1.App;


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by Grimbode on 30/06/2017.
 */
exports.__esModule = true;
exports.VIMEO_ROUTES = {
    DEFAULT: function (uri) {
        if (uri === void 0) { uri = ""; }
        return "https://api.vimeo.com" + uri;
    },
    TICKET: function () { return exports.VIMEO_ROUTES.DEFAULT() + "/me/videos"; }
};


/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var chunk_1 = __webpack_require__(4);
/**
 * Created by kfaulhaber on 30/06/2017.
 */
var ChunkService = (function () {
    function ChunkService(mediaService, preferredUploadDuration, size, offset) {
        if (offset === void 0) { offset = 0; }
        this.mediaService = mediaService;
        this.preferredUploadDuration = preferredUploadDuration;
        this.size = size;
        this.offset = offset;
    }
    ChunkService.prototype.updateSize = function (uploadDuration) {
        var adjust = 1;
        if (uploadDuration / this.preferredUploadDuration < 0.5) {
            console.log("Adjusting");
            adjust = 0.5;
        }
        else if (uploadDuration / this.preferredUploadDuration > 2) {
            adjust = 2;
        }
        console.log("Upload duration", uploadDuration);
        this.size = Math.floor((this.size * this.preferredUploadDuration) / uploadDuration * adjust);
    };
    ChunkService.prototype.create = function () {
        var end = Math.min(this.offset + this.size, this.mediaService.media.file.size);
        //TODO: Simplify
        if (end - this.offset !== this.size) {
            this.updateSize(end - this.offset);
        }
        var content = this.mediaService.media.file.slice(this.offset, end);
        return new chunk_1.Chunk(content, "bytes " + this.offset + "-" + end + "/" + this.mediaService.media.file.size);
    };
    ChunkService.prototype.updateOffset = function (range) {
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    };
    ChunkService.prototype.isDone = function () {
        return this.offset >= this.mediaService.media.file.size;
    };
    return ChunkService;
}());
exports.ChunkService = ChunkService;


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var media_1 = __webpack_require__(6);
/**
 * Created by kfaulhaber on 21/07/2017.
 */
var MediaService = (function () {
    function MediaService(options) {
        this.options = options;
        this.media = new media_1.Media();
        this.setData(options);
    }
    MediaService.prototype.setData = function (options) {
        for (var prop in options) {
            if (options.hasOwnProperty(prop) && this.media.hasOwnProperty(prop)) {
                this.media[prop] = options[prop];
            }
        }
        if (this.media.file !== null && this.media.name === "") {
            this.media.name = this.media.file.name;
        }
    };
    return MediaService;
}());
exports.MediaService = MediaService;


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var event_service_1 = __webpack_require__(2);
var utils_1 = __webpack_require__(19);
var stat_data_1 = __webpack_require__(9);
/**
 * Created by Grimbode on 14/07/2017.
 */
var StatService = (function () {
    function StatService(timeInterval, chunkService) {
        this.timeInterval = timeInterval;
        this.chunkService = chunkService;
        this.si = -1;
        this.previousTotalPercent = 0;
    }
    StatService.prototype.start = function () {
        this.totalStatData = this.create(true);
        this.startInterval();
    };
    StatService.prototype.create = function (isTotal) {
        if (isTotal === void 0) { isTotal = false; }
        var date = new Date();
        var size = (isTotal) ? this.chunkService.mediaService.media.file.size : this.chunkService.size;
        var statData = new stat_data_1.StatData(date, date, 0, size);
        return statData;
    };
    StatService.prototype.save = function (timeData) {
        this.chunkStatData = timeData;
    };
    StatService.prototype.estimateTimeLeft = function (statData) {
        var nTime = Math.floor(new Date().getTime() - statData.start.getTime());
        var ratio = this.calculateRatio(statData);
        return (ratio > 0) ? Math.floor(nTime * ratio) : nTime;
    };
    StatService.prototype.calculateRatio = function (statData) {
        return statData.loaded / statData.total;
    };
    StatService.prototype.calculatePercent = function (statData) {
        return Math.floor(this.calculateRatio(statData) * 100);
    };
    StatService.prototype.calculateUploadSpeed = function (seconds) {
        return (seconds > 0) ? Math.floor(this.chunkStatData.total / seconds) : 0;
    };
    StatService.prototype.updateTotal = function () {
        this.totalStatData.loaded += this.chunkStatData.total;
    };
    StatService.prototype.startInterval = function () {
        var _this = this;
        if (this.si > -1) {
            this.stop();
        }
        this.si = setInterval(function () {
            var chunkPercent = 100;
            if (_this.chunkStatData.done) {
                _this.updateTotal();
                _this.chunkStatData.total = _this.chunkStatData.loaded = 0;
            }
            else {
                chunkPercent = _this.calculatePercent(_this.chunkStatData);
            }
            _this.totalStatData.end = _this.chunkStatData.end;
            _this.previousTotalPercent = Math.max(_this.totalStatData.loaded + _this.chunkStatData.loaded, _this.previousTotalPercent);
            var totalPercent = _this.calculatePercent(new stat_data_1.StatData(_this.totalStatData.start, _this.totalStatData.end, _this.previousTotalPercent, _this.totalStatData.total));
            var chunkTimeLeft = (!_this.chunkStatData || _this.chunkStatData.done) ? 0 : _this.estimateTimeLeft(_this.chunkStatData);
            var chunkSecondsLeft = utils_1.TimeUtil.TimeToSeconds(chunkTimeLeft);
            var timeLeft = _this.estimateTimeLeft(_this.totalStatData);
            var secondsLeft = utils_1.TimeUtil.TimeToSeconds(timeLeft);
            var uploadSpeed = _this.calculateUploadSpeed(chunkSecondsLeft);
            event_service_1.EventService.Dispatch("estimatedtimechanged", {
                seconds: secondsLeft,
                timeFormat: utils_1.TimeUtil.MilisecondsToString(timeLeft)
            });
            event_service_1.EventService.Dispatch("estimatedchunktimechanged", {
                seconds: chunkSecondsLeft,
                timeFormat: utils_1.TimeUtil.MilisecondsToString(chunkTimeLeft)
            });
            event_service_1.EventService.Dispatch("chunkprogresschanged", chunkPercent);
            if (_this.totalStatData.done) {
                totalPercent = 100;
            }
            event_service_1.EventService.Dispatch("estimateduploadspeedchanged", uploadSpeed);
            event_service_1.EventService.Dispatch("totalprogresschanged", totalPercent);
        }, this.timeInterval);
    };
    StatService.prototype.stop = function () {
        clearInterval(this.si);
    };
    StatService.prototype.getChunkUploadDuration = function () {
        return utils_1.TimeUtil.TimeToSeconds(this.chunkStatData.end.getTime() - this.chunkStatData.start.getTime());
    };
    return StatService;
}());
exports.StatService = StatService;


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var http_service_1 = __webpack_require__(0);
var ticket_1 = __webpack_require__(10);
var routes_1 = __webpack_require__(12);
/**
 * Created by kfaulhaber on 30/06/2017.
 */
var TicketService = (function () {
    function TicketService(token, httpService) {
        this.token = token;
        this.httpService = httpService;
    }
    TicketService.prototype.open = function () {
        var request = http_service_1.HttpService.CreateRequest("POST", routes_1.VIMEO_ROUTES.TICKET(), JSON.stringify({ type: 'streaming' }), {
            Authorization: "Bearer " + this.token,
            'Content-Type': 'application/json'
        });
        return this.httpService.send(request);
    };
    TicketService.prototype.save = function (response) {
        this.ticket = new ticket_1.Ticket(response.data.upload_link_secure, response.data.ticket_id, response.data.upload_link, response.data.complete_uri, response.data.user);
    };
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
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

exports.__esModule = true;
var http_service_1 = __webpack_require__(0);
/**
 * Created by kfaulhaber on 30/06/2017.
 */
var UploadService = (function () {
    function UploadService(mediaService, ticketService, httpService) {
        this.mediaService = mediaService;
        this.ticketService = ticketService;
        this.httpService = httpService;
    }
    UploadService.prototype.send = function (chunk) {
        console.log(chunk.content, chunk.contentRange);
        var request = http_service_1.HttpService.CreateRequest("PUT", this.ticketService.ticket.uploadLinkSecure, chunk.content, {
            'Content-Type': this.mediaService.media.file.type,
            'Content-Range': chunk.contentRange
        });
        return this.httpService.send(request, true);
    };
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
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 30/06/2017.
 */
exports.__esModule = true;
var ValidatorService = (function () {
    function ValidatorService(supportedFiles) {
        this.supportedFiles = supportedFiles;
    }
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
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/**
 * Created by kfaulhaber on 17/07/2017.
 */
exports.__esModule = true;
var TimeUtil = (function () {
    function TimeUtil() {
    }
    TimeUtil.TimeToSeconds = function (time) {
        return time / 1000;
    };
    TimeUtil.TimeToString = function (time) {
        var date = new Date(null);
        date.setTime(time);
        return date.toISOString().substr(11, 8);
    };
    TimeUtil.MilisecondsToString = function (miliseconds) {
        var seconds = TimeUtil.TimeToSeconds(miliseconds);
        var date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    };
    return TimeUtil;
}());
exports.TimeUtil = TimeUtil;


/***/ })
/******/ ]);
//# sourceMappingURL=vimeo-upload.js.map