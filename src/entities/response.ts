/**
 * Created by kfaulhaber on 20/07/2017.
 */

export class Response {

    public range: string = null;

    constructor(
        public status: number,
        public statusText: string,
        public data: any = null,
        public duration: number = null
    ){}
}