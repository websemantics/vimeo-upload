import {Status} from "../enums/status.enum";
/**
 * Created by kfaulhaber on 20/07/2017.
 */

export class Response {

    public responseHeaderData: string = null;
    public duration: number = -1;
    public statusCode: Status = Status.Neutral;

    constructor(
        public status: number,
        public statusText: string,
        public data: any = null
    ){}
}