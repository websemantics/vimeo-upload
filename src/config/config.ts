/**
 * Created by kfaulhaber on 13/07/2017.
 */

export const DEFAULT_VALUES = {
  preferredUploadDuration:  30,
  chunkSize:                1024*1024,
  token:                    "TOKEN_STRING_HERE",
  supportedFiles:           ["mov", "mpeg4", "mp4", "avi", "wmv", "mpegps", "flv", "3gpp", "webm"],
  name:                     "",
  description:              "",
  file:                     null,
  upgrade_to_1080:          false
};

export const DEFAULT_EVENTS = {
  chunkprogresschanged: (event: CustomEvent)=>console.log(`Default: Chunk Progress Update: ${event.detail}/100`),
  totalprogresschanged: (event: CustomEvent)=>console.log(`Default: Total Progress Update: ${event.detail}/100`),
  estimatedtimechanged: (event: CustomEvent)=>console.log(`Default: Estimated Time Update: ${event.detail}`),
  estimateduploadspeedchanged: (event: CustomEvent)=>console.log(`Default: Estimated Upload Speed Changed: ${event.detail} mb/s`),
  uploadaborted: (event: CustomEvent)=>console.log(`Default: Upload aborted detected.`)
};