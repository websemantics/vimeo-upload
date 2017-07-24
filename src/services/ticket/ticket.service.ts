import {HttpService} from "../http/http.service";
import {Ticket} from "../../entities/ticket";
import {Response} from "../../entities/response";
import {VIMEO_ROUTES} from "../../routes/routes";
/**
 * Created by kfaulhaber on 30/06/2017.
 */

export class TicketService {

    public ticket:Ticket;

    constructor(
        public token:     string
    ){}

    public open<T>(): Promise<T> {
        return new HttpService("POST", VIMEO_ROUTES.TICKET(), JSON.stringify({ type: 'streaming' }), {
            Authorization: `Bearer ${this.token}`,
            'Content-Type': 'application/json'
        }).send();
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
        return new HttpService("DELETE", VIMEO_ROUTES.DEFAULT(this.ticket.completeUri), null, {
            Authorization: `Bearer ${this.token}`
        }).send();
    }
}

