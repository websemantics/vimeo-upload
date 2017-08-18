/**
 * Created by Kfaulhaber on 30/06/2017.
 *
 * Basic route creater
 *
 */

export const VIMEO_ROUTES = {
    DEFAULT:            (uri:string = "")=>`https://api.vimeo.com${uri}`,
    TICKET:             ()=>`${VIMEO_ROUTES.DEFAULT()}/me/videos`,
    VIDEOS:             (videoId: number)=>`${VIMEO_ROUTES.DEFAULT(`/videos/${videoId}`)}`
};
