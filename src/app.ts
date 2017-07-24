import {TicketService} from "./services/ticket/ticket.service";
import {ChunkService} from "./services/chunk/chunk.service";
import {UploadService} from "./services/upload/upload.service";
import {DEFAULT_VALUES} from "./config/config";
import {EventService} from "./services/event/event.service";
import {TimeUtil} from "./utils/utils";
import {ValidatorService} from "./services/validator/validator.service";
import {MediaService} from "./services/media/media.service";
import {Response} from "./entities/response";
/**
 * Created by Grimbode on 12/07/2017.
 */

export class App {
    
    public ticketService: TicketService;
    public chunkService: ChunkService;
    public uploadService: UploadService;
    public validatorService: ValidatorService;
    public mediaService: MediaService;

    constructor(options: any = {}){

        for(let prop in options){
            if(!options.hasOwnProperty(prop)){
                continue;
            }
            switch(true){
                case DEFAULT_VALUES.hasOwnProperty(prop):
                    DEFAULT_VALUES[prop] = options[prop];
                    break;
                default:
                    console.warn(`Unrecognized property: ${prop}`);
            }
        }
       
        this.ticketService = new TicketService(
            DEFAULT_VALUES.token
        );

        this.mediaService = new MediaService(
            DEFAULT_VALUES
        );

        this.chunkService = new ChunkService(
            this.mediaService,
            DEFAULT_VALUES.preferredUploadDuration,
            DEFAULT_VALUES.chunkSize
        );

        this.uploadService = new UploadService(
            this.mediaService,
            this.ticketService
        );

        this.validatorService = new ValidatorService(
            DEFAULT_VALUES.supportedFiles
        );
        

    }
    
    public start(options: any = {}){
        this.mediaService.setData(options);

        if(options.token){
            this.ticketService.token = DEFAULT_VALUES.token = options.token;
        }

        //TODO: Add error if not supported.

        if(!this.validatorService.isSupported(this.mediaService.media.file)) return;
        this.ticketService.open()
            .then((response: Response)=>{
                console.log(response);

                this.ticketService.save(response);
                this.process();
            }).catch((error)=>{
                console.log(`Error occured while generating ticket. ${error}`);
            });
    }

    private process(){
        console.log("Processing");
        let chunk = this.chunkService.create();
        console.log(chunk.content, chunk.contentRange);
        this.uploadService.send(chunk).then((response: Response) => {
            //TODO: Calculate the correct time.
            EventService.Dispatch("estimatedtimechanged", response.duration);
            EventService.Dispatch("estimateduploadspeedchanged", this.chunkService.size/response.duration);
            let seconds = TimeUtil.TimeToSeconds(response.duration);
            this.chunkService.updateSize(seconds);
            this.check();
        }).catch(error=>{
            console.error(`Error sending chunk`, error);
        });
    }

    private check(){
        this.uploadService.getRange().then((response: Response) => {
            switch(response.status){
                case 308:
                    console.log(`New range ${response.range}`);
                    this.chunkService.updateOffset(response.range);
                    EventService.Dispatch("totalprogresschanged", this.chunkService.getPercent());

                    if(this.chunkService.isDone()){
                        this.done();
                        return;
                    }

                    this.process();
                    break;
                case 200 || 201:
                    this.ticketService.close().then((response:any)=>{
                        console.log(response);
                    }).catch(error=>{
                       console.log(error);
                    });
                    break;
                default:
                    console.warn(`Unrecognized status code (${response.status}) for chunk range.`)
            }
        }).catch(error=>{
            console.error(`Error getting chunk range`, error);
        })
    }

    //TODO: find a way to reset
    public done(){
        this.ticketService.close().then((response: Response)=>{
            console.log(`Delete success:`, response);
        }).catch((error)=>{
            console.warn(`Delete failed:`, error);
        });
    }

    public abort(){
        EventService.Dispatch("uploadaborted");
        this.done();
    }
    public static On(eventName: string, callback: any = null){
        if(!EventService.Exists(eventName)) return;
        if(callback === null){
            callback = EventService.GetDefault(eventName);
        }
        EventService.Add(eventName, callback);
    }
    
    public static Off(eventName: string, callback: any = null){
        if(!EventService.Exists(eventName)) return;
        if(callback === null){
            callback = EventService.GetDefault(eventName);
        }
        EventService.Remove(eventName, callback)
    }
    
}