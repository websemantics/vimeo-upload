import {Chunk} from "../../entities/chunk";
import {HttpService} from "../http/http.service";
import {TicketService} from "../ticket/ticket.service";
import {MediaService} from "../media/media.service";
import {StatService} from "../stat/stat.service";
import {Status} from "../../enums/status.enum";
import {Response} from "../../entities/response";
/**
 * Created by kfaulhaber on 30/06/2017.
 */


export class UploadService {

    /**
     * constructor that has mulitple dependencies to other services
     * @param mediaService
     * @param ticketService
     * @param httpService
     * @param statService
     */
    constructor(
        public mediaService: MediaService,
        public ticketService: TicketService,
        public httpService: HttpService,
        public statService: StatService
    ){}

    /**
     * Method that sends a request with the video chunk data
     * @param chunk
     * @returns {Promise<T>}
     */
        public send<T>(chunk: Chunk): Promise<T>{

            let statData = this.statService.create();
            this.statService.save(statData);
            let request = HttpService.CreateRequest("PUT", this.ticketService.ticket.uploadLinkSecure, chunk.content, {
                'Content-Type': this.mediaService.media.file.type,
                'Content-Range': chunk.contentRange
            });

            return this.httpService.send(request, statData);
    }

    /**
     * getRange method that gets the byte range of the already uploaded video content
     * @returns {Promise<T>}
     */
    public getRange<T>(): Promise<T>{
        let request = HttpService.CreateRequest("PUT", this.ticketService.ticket.uploadLinkSecure, null, {
            'Content-Type': this.mediaService.media.file.type,
            'Content-Range': 'bytes */* '
        });
        return this.httpService.send(request);
    }
}