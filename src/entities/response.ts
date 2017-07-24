/**
 * Created by kfaulhaber on 20/07/2017.
 */

export class Response {

    public range: string = null;
    public duration: number = -1;
    
    constructor(
        public status: number,
        public statusText: string,
        public data: any = null
    ){}
}