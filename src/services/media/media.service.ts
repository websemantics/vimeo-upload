import {Media} from "../../entities/media";
import {HttpService} from "../http/http.service";
import {VIMEO_ROUTES} from "../../routes/routes";
/**
 * Created by kfaulhaber on 21/07/2017.
 */

export class MediaService {

    public media: Media;

    /**
     * constructor that initiates the services with the list of dependencies
     * @param httpService
     * @param file
     * @param name
     * @param description
     * @param upgrade_to_1080
     * @param useDefaultFileName
     * @param privacy
     */
    constructor(
        public httpService: HttpService,
        file: File,
        name: string,
        description: string,
        upgrade_to_1080: boolean,
        useDefaultFileName: boolean,
        privacy: boolean
    ){

        let mediaName = (useDefaultFileName) ? file.name : name;

        this.media = new Media(mediaName, description, file, upgrade_to_1080, privacy);

        if(useDefaultFileName){
            this.media.name = this.media.file.name;
        }
    }

    /**
     * updateVideoData method that sends a request to edit video information.
     * Will not work if the token does not have the "EDIT" scope. Will return a 403 forbidden.
     * @param token
     * @param vimeoId
     * @returns {Promise<T>}
     */
    public updateVideoData<T>(token: string, vimeoId: number): Promise<T>{

        let params = this.media.toJSON();

        let query = Object.keys(this.media.toJSON()).map(key=>`${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`);
        console.log("data", params, query)
        
        let request = HttpService.CreateRequest("PATCH", VIMEO_ROUTES.VIDEOS(vimeoId), query, {
            Authorization: `Bearer ${token}`
        });
        return this.httpService.send(request);
    }

    /**
     * GetMeta static method returns an object with data from updateVideoData response
     * @param vimeoId
     * @param data
     * @returns {{id: number, link: (any|HTMLLinkElement|(function(string): string)), name: any, uri: any, createdTime: any}}
     * @constructor
     */
    public static GetMeta(vimeoId: number, data: any): Object{
        return {
            id:             vimeoId,
            link:           data.link,
            name:           data.name,
            uri:            data.uri,
            createdTime:    data.created_time
        };
    }
}