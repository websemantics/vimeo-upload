import {Chunk} from "../../entities/chunk";
import {HttpService} from "../http/http.service";
import {TicketService} from "../ticket/ticket.service";
import {MediaService} from "../media/media.service";
import {StatService} from "../stat/stat.service";
import {Status} from "../../enums/status.enum";
/**
 * Created by kfaulhaber on 30/06/2017.
 */


export class UploadService {

    constructor(
        public mediaService: MediaService,
        public ticketService: TicketService,
        public httpService: HttpService,
        public statService: StatService
    ){}

        public send<T>(chunk: Chunk): Promise<T>{
            console.log(chunk.content, chunk.contentRange);

            let statData = this.statService.create();
            this.statService.save(statData);
            let request = HttpService.CreateRequest("PUT", this.ticketService.ticket.uploadLinkSecure, chunk.content, {
                'Content-Type': this.mediaService.media.file.type,
                'Content-Range': chunk.contentRange
            });

            return this.httpService.send(request, statData);
    }

    public getRange<T>(): Promise<T>{
        let request = HttpService.CreateRequest("PUT", this.ticketService.ticket.uploadLinkSecure, null, {
            'Content-Type': this.mediaService.media.file.type,
            'Content-Range': 'bytes */* '
        });
        return this.httpService.send(request, null, UploadService.RangeResolver);
    }

    public static RangeResolver(xhr: XMLHttpRequest, response: Response) {
        switch(xhr.status){
            case 308:
                response.responseHeaderData = xhr.getResponseHeader("Range");
                response.statusCode = Status.Resolved;
                break;
            case 200 || 201:
                response.statusCode = Status.Resolved;
                break;
            default:
                console.warn(`Unexpected xhr status found (${xhr.status}).`);
        }

        if(xhr.status === 308){
            response.responseHeaderData = xhr.getResponseHeader("Range");
        }
    }

}