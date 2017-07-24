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

        console.log(this.size, uploadDuration, this.preferredUploadDuration);

        this.size = Math.floor((this.size*this.preferredUploadDuration)/uploadDuration);
    }
    
    public create(): Chunk{
        let end = Math.min(this.offset + this.size, this.mediaService.media.file.size);
        let content = this.mediaService.media.file.slice(this.offset, end);

        return new Chunk(
            content,
            `bytes ${this.offset}-${end}/${this.mediaService.media.file.size}`
        )
    }
    
    public updateOffset(range: string){
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }

    public getPercent(): number {
        return Math.floor(this.offset/this.mediaService.media.file.size * 100);
    }

    public isDone(): boolean {
        return this.offset >= this.mediaService.media.file.size;
    }
}