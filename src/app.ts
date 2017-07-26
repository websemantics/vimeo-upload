import {TicketService} from "./services/ticket/ticket.service";
import {ChunkService} from "./services/chunk/chunk.service";
import {UploadService} from "./services/upload/upload.service";
import {DEFAULT_VALUES} from "./config/config";
import {EventService} from "./services/event/event.service";
import {ValidatorService} from "./services/validator/validator.service";
import {MediaService} from "./services/media/media.service";
import {Response} from "./entities/response";
import {HttpService} from "./services/http/http.service";
import {StatService} from "./services/stat/stat.service";
/**
 * Created by Grimbode on 12/07/2017.
 */


export class App {
    
    public ticketService: TicketService;
    public chunkService: ChunkService;
    public uploadService: UploadService;
    public validatorService: ValidatorService;
    public mediaService: MediaService;
    public statService: StatService;
    public httpService: HttpService;

    //TODO: find a cleaner way for this
    public failCount: number = 0;
    public maxFailAccount: number = 5;

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

        this.mediaService = new MediaService(
            DEFAULT_VALUES
        );

        this.chunkService = new ChunkService(
            this.mediaService,
            DEFAULT_VALUES.preferredUploadDuration,
            DEFAULT_VALUES.chunkSize
        );

        this.statService = new StatService(
            DEFAULT_VALUES.timeInterval,
            this.chunkService
        );

        this.httpService = new HttpService();

        this.ticketService = new TicketService(
            DEFAULT_VALUES.token,
            this.httpService
        );



        this.uploadService = new UploadService(
            this.mediaService,
            this.ticketService,
            this.httpService,
            this.statService
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
                this.statService.start();
                this.process();
            }).catch((error)=>{
                console.log(`Error occured while generating ticket. ${error}`);
            });
    }

    private process(){
        let chunk = this.chunkService.create();
        console.log(chunk.content, chunk.contentRange);
        this.uploadService.send(chunk).then((response: Response) => {
            this.chunkService.updateSize(this.statService.getChunkUploadDuration());
            this.check();
        }).catch(error=>{
            if(this.failCount <= this.maxFailAccount){
                this.failCount++;
                console.error(`Error sending chunk: ${this.failCount}`);
                //TODO: Probably should modify
                this.chunkService.updateSize(this.statService.getChunkUploadDuration());
                this.check();
            }
        });
    }

    private check(){
        this.uploadService.getRange().then((response: Response) => {
            switch(response.status){
                case 308:
                    this.chunkService.updateOffset(response.responseHeaderData);
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
        this.statService.totalStatData.done = true;
        this.ticketService.close().then((response: Response)=>{
            this.statService.stop();
            console.log(`Delete success:`, response);
        }).catch((error)=>{
            this.statService.stop();
            console.warn(`Delete failed:`, error);
        });
    }

    public abort(){
        EventService.Dispatch("uploadaborted");
        this.done();
    }
    public on(eventName: string, callback: any = null){
        if(!EventService.Exists(eventName)) return;
        if(callback === null){
            callback = EventService.GetDefault(eventName);
        }
        EventService.Add(eventName, callback);
    }
    
    public off(eventName: string, callback: any = null){
        if(!EventService.Exists(eventName)) return;
        if(callback === null){
            callback = EventService.GetDefault(eventName);
        }
        EventService.Remove(eventName, callback)
    }
    
}