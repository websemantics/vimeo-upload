import {Media} from "../../entities/media";
import {HttpService} from "../http/http.service";
import {VIMEO_ROUTES} from "../../routes/routes";
/**
 * Created by kfaulhaber on 21/07/2017.
 */

export class MediaService {

    public media: Media;

    constructor(
        public httpService: HttpService,
        public options: any
    ){
        this.media = new Media();
        this.setData(options);
    }

    public setData(options: any){
        for(let prop in options){
            if(options.hasOwnProperty(prop) && this.media.hasOwnProperty(prop)){
                this.media[prop] = options[prop];
            }
        }

        if(this.media.file !== null && this.media.name === ""){
            this.media.name = this.media.file.name;
        }

    }
    
    public updateVideoData<T>(token: string, videoId: number): Promise<T>{
        let request = HttpService.CreateRequest("PATCH", VIMEO_ROUTES.VIDEOS(videoId), JSON.stringify(this.media.toJSON()), {
            Authorization: `Bearer ${token}`
        });
        return this.httpService.send(request);
    }
}