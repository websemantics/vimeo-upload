import {Status} from "../enums/status.enum";
import {Header} from "./header";
/**
 * Created by kfaulhaber on 20/07/2017.
 *
 * Custom Response Entity
 *
 */

export class Response {

    public responseHeaders: Header[];
    public statusCode: Status = Status.Neutral;

    constructor(
        public status: number,
        public statusText: string,
        public data: any = null
    ){}
}