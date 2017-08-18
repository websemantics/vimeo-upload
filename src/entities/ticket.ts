/**
 * Created by kfaulhaber on 13/07/2017.
 *
 * Ticket Entity
 *
 */

export class Ticket {
    constructor(
        public uploadLinkSecure: string,
        public ticketId: string,
        public uploadLink: string,
        public completeUri: string,
        public user: any
    ){}
}