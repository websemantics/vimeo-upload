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

    /**
     * constructor that takes 3 paramaters
     * @param token
     * @param httpService
     * @param upgrade_to_1080
     */
    constructor(
        public token:     string,
        public httpService: HttpService,
        public upgrade_to_1080: boolean
    ){}

    /**
     * open method that creates a ticket request
     * @returns {Promise<T>}
     */
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

    /**
     * save method that takes a response from creating a ticket upload request and saves it
     * @param response
     */
    public save(response: Response){
        this.ticket = new Ticket(
            response.data.upload_link_secure,
            response.data.ticket_id,
            response.data.upload_link,
            response.data.complete_uri,
            response.data.user
        );
    }

    /**
     * close method that sends a DELETE request to the ticket's complete Uri to complete and finalize the upload.
     * Called at the end of the upload when all the bytes have been sent.
     * @returns {Promise<T>}
     */
    public close<T>(): Promise<T>{
        let request = HttpService.CreateRequest("DELETE", VIMEO_ROUTES.DEFAULT(this.ticket.completeUri), null, {
            Authorization: `Bearer ${this.token}`
        });
        return this.httpService.send(request)
    }
}

