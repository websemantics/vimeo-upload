import {Chunk} from "../../entities/chunk";
import {MediaService} from "../media/media.service";
/**
 * Created by kfaulhaber on 30/06/2017.
 */

export class ChunkService {

    constructor(
        public mediaService: MediaService,
        public preferredUploadDuration:number,
        public size:number,
        public offset: number = 0
    ){}
    
    public updateSize(uploadDuration: number) {
        this.size = Math.floor((this.size*this.preferredUploadDuration)/uploadDuration);
    }
    
    public create(): Chunk{
        let end = Math.min(this.offset + this.size, this.mediaService.media.file.size);

        //TODO: Simplify
        if(end-this.offset !== this.size){
            this.updateSize(end-this.offset);
        }

        let content = this.mediaService.media.file.slice(this.offset, end);

        return new Chunk(
            content,
            `bytes ${this.offset}-${end}/${this.mediaService.media.file.size}`
        )
    }
    
    public updateOffset(range: string){
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }

    public isDone(): boolean {
        return this.offset >= this.mediaService.media.file.size;
    }
}