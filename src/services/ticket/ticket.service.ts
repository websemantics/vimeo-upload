import {HttpService} from "../http/http.service";
import {Ticket} from "../../entities/ticket";
import {Response} from "../../entities/response";
import {VIMEO_ROUTES} from "../../routes/routes";
import {Status} from "../../enums/status.enum";
/**
 * Created by kfaulhaber on 30/06/2017.
 */

export class TicketService {

    public ticket:Ticket;

    constructor(
        public token:     string,
        public httpService: HttpService,
        public upgrade_to_1080: boolean
    ){}

    public open<T>(): Promise<T> {

        let data = { type: 'streaming' };

        if(this.upgrade_to_1080){
            data["upgrade_to_1080"] = this.upgrade_to_1080;
        }

        let request = HttpService.CreateRequest("POST", VIMEO_ROUTES.TICKET(), JSON.stringify(data), {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        });

        return this.httpService.send(request);
    }

    public save(response: Response){
        this.ticket = new Ticket(
            response.data.upload_link_secure,
            response.data.ticket_id,
            response.data.upload_link,
            response.data.complete_uri,
            response.data.user
        );
    }

    public close<T>(): Promise<T>{
        let request = HttpService.CreateRequest("DELETE", VIMEO_ROUTES.DEFAULT(this.ticket.completeUri), null, {
            Authorization: `Bearer ${this.token}`
        });
        return this.httpService.send(request, null, TicketService.CloseResolver)
    }

    public static CloseResolver(xhr: XMLHttpRequest, response: Response){
        if(xhr.status < 400){
            response.statusCode = Status.Resolved;
            response.responseHeaderData = xhr.getResponseHeader("Location").replace("/videos/", "");
        }
    }
}

