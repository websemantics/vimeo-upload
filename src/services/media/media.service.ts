import {Media} from "../../entities/media";
/**
 * Created by kfaulhaber on 21/07/2017.
 */

export class MediaService {

    public media: Media;

    constructor(
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
}