/**
 * Created by kfaulhaber on 13/07/2017.
 */

export const DEFAULT_VALUES = {
  preferredUploadDuration:  20,
  chunkSize:                1024*1024,
  token:                    "TOKEN_STRING_HERE", //Required
  supportedFiles:           ["mov", "mpeg4", "mp4", "avi", "wmv", "mpegps", "flv", "3gpp", "webm"],
  name:                     "",
  description:              "",
  file:                     null, //Required
  upgrade_to_1080:          false,
  timeInterval:             150,
  maxAcceptedFails:         20,
  maxAcceptedUploadDuration: 60,
  useDefaultFileName:       false,
  privacy:                  false,
  retryTimeout:             5000
};

export const DEFAULT_EVENTS = {
  chunkprogresschanged: (event: CustomEvent)=>console.log(`Default: Chunk Progress Update: ${event.detail}/100`),
  totalprogresschanged: (event: CustomEvent)=>console.log(`Default: Total Progress Update: ${event.detail}/100`),
  error:                  ()=>{},
  complete:               ()=>{}
};