/**
 * Created by kfaulhaber on 13/07/2017.
 */


export class Chunk {
    constructor(
        public content: Blob,
        public contentRange: string
    ){}
}