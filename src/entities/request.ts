import {Header} from "./header";
/**
 * Created by kfaulhaber on 17/07/2017.
 */


export class Request {

    constructor(
        public method: string,
        public url: string,
        public data: any = null,
        public headers: Header[] = []
    ){}
}