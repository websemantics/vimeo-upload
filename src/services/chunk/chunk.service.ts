import {Chunk} from "../../entities/chunk";
import {MediaService} from "../media/media.service";
/**
 * Created by kfaulhaber on 30/06/2017.
 */

export class ChunkService {

    private static Adjuster: number = 0.7;

    /**
     * constructor
     * @param mediaService
     * @param preferredUploadDuration
     * @param size
     * @param offset
     */
    constructor(
        public mediaService: MediaService,
        public preferredUploadDuration:number,
        public size:number,
        public offset: number = 0
    ){}

    /**
     * updateSize method that updates the next chunk size based on the uploadDuration compares to the prefferedUploadDuration
     * @param uploadDuration
     */
    public updateSize(uploadDuration: number) {
        this.size = Math.floor((this.size*this.preferredUploadDuration)/uploadDuration*ChunkService.Adjuster);
    }

    /**
     * create method that returns the next chunk to upload from the byte array
     * @returns {Chunk}
     */
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

    /**
     * updateOffset method that takes a range and updates the offset.
     * @param range
     */
    public updateOffset(range: string){
        this.offset = parseInt(range.match(/\d+/g).pop(), 10) + 1;
    }

    /**
     * isDone method that checks to see if the offset is or is superior to the file size.
     * @returns {boolean}
     */
    public isDone(): boolean {
        return this.offset >= this.mediaService.media.file.size;
    }
}