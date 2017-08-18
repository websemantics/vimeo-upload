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
import {Header} from "./entities/header";

export class App {

    //Defining all services
    private ticketService: TicketService;
    private chunkService: ChunkService;
    private uploadService: UploadService;
    private validatorService: ValidatorService;
    private mediaService: MediaService;
    private statService: StatService;
    private httpService: HttpService;

    //Defining other properties
    private failCount: number = 0;
    private maxAcceptedFails: number;
    private retryTimeout: number;

    /**
     * Method that initializes the VimeoUpload library. Called everytime an upload is started.
     * Resets all the services and properties. To see "config/config.ts" for all properties that can be added to options.
     * @param options
     */
    public init(options: any = {}){

        let values: any = {};

        //We loop through all the default values and see if options overides specific ones. All new properties are added to values object.
        for(let prop in DEFAULT_VALUES){
            if(DEFAULT_VALUES.hasOwnProperty(prop)){
                values[prop] = (options.hasOwnProperty(prop)) ? options[prop]: DEFAULT_VALUES[prop];
            }
        }

        this.maxAcceptedFails = values.maxAcceptedFails;
        this.httpService = new HttpService(
            values.maxAcceptedUploadDuration
        );
        this.mediaService = new MediaService(
            this.httpService,
            values.file,
            values.videoData,
            values.upgrade_to_1080,
            values.useDefaultFileName
        );
        this.chunkService = new ChunkService(
            this.mediaService,
            values.preferredUploadDuration,
            values.chunkSize
        );
        this.statService = new StatService(
            values.timeInterval,
            this.chunkService
        );
        this.ticketService = new TicketService(
            values.token,
            this.httpService,
            values.upgrade_to_1080
        );
        this.uploadService = new UploadService(
            this.mediaService,
            this.ticketService,
            this.httpService,
            this.statService
        );
        this.validatorService = new ValidatorService(
            values.supportedFiles
        );
    }

    /**
     * Start method that'll initiate the upload, create the upload ticket and start the upload loop.
     * @param options
     */
    public start(options: any = {}){
        this.init(options);

        //TODO: Add error if not supported.

        if(!this.validatorService.isSupported(this.mediaService.media.file)) return;
        this.ticketService.open()
            .then((response: Response)=>{
                console.log(response);
                this.ticketService.save(response);
                this.statService.start();
                this.process();
            }).catch((error)=>{
                if(this.canContinue()){
                    this.failCount++;
                    EventService.Dispatch("vimeouploaderror", { message:`Error creating ticket.`, error});
                    setTimeout(()=>{
                        this.start(options);
                    }, this.retryTimeout);
                }
            });
    }



    /**
     * Process method that will seek the next chunk to upload
     */
    private process(){
        let chunk = this.chunkService.create();
        this.uploadService.send(chunk).then((response: Response) => {
            this.chunkService.updateSize(this.statService.getChunkUploadDuration());
            this.check();
        }).catch(error=>{
            if(this.canContinue()){
                this.failCount++;
                EventService.Dispatch("vimeouploaderror", { message:`Error sending chunk.`, error});
                this.chunkService.updateSize(this.statService.getChunkUploadDuration());
                setTimeout(()=>{
                    this.check();
                }, this.retryTimeout);
            }
        });
    }

    /**
     * Check method that is called after each chunk upload to update the byte range.
     */
    private check(){
        this.uploadService.getRange().then((response: Response) => {
            switch(response.status){
                case 308:

                    //noinspection TypeScriptValidateTypes
                    let range: Header = response.responseHeaders.find((header: Header) => {
                        if(header === null && header === undefined) return false;
                        return header.title === "Range";
                    });

                    this.chunkService.updateOffset(range.value);
                    if(this.chunkService.isDone()){
                        this.done();
                        return;
                    }
                    this.process();
                    break;
                case 200 || 201:
                    this.done();
                    break;
                default:
                    console.warn(`Unrecognized status code (${response.status}) for chunk range.`)
            }
        }).catch(error=>{
            EventService.Dispatch("vimeouploaderror", { message: `Unable to get range.`, error});
            if(this.canContinue()){
                this.failCount++;
                setTimeout(()=>{
                    this.check();
                }, this.retryTimeout);
            }

        })
    }

    /**
     * Done method that is called when an upload has been completed. Closes the upload ticket.
     */
    private done(){
        this.statService.totalStatData.done = true;
        this.ticketService.close().then((response: Response)=>{
            this.statService.stop();
            try{
                //noinspection TypeScriptValidateTypes
                let vimeoId: number = parseInt(response.responseHeaders.find((header: Header) => {
                    //noinspection TypeScriptValidateTypes
                    if(header === null && header === undefined) return false;
                    return header.title === "Location";
                }).value.replace("/videos/", ""));
                this.updateVideo(vimeoId);

            }catch(error){
                console.log(`Error retrieving Vimeo Id.`);
            }

            console.log(`Delete success:`, response);
        }).catch((error)=>{
            this.statService.stop();
            EventService.Dispatch("vimeouploaderror", { message:`Unable to close upload ticket.`, error});
        });
    }

    /**
     * UpdateVideo method
     * @param vimeoId
     */
    private updateVideo(vimeoId: number){
        this.mediaService.updateVideoData(this.ticketService.token, vimeoId).then((response: Response) => {
            let meta = MediaService.GetMeta(vimeoId, response.data);
            EventService.Dispatch("vimeouploadcomplete", meta);
        }).catch(error=>{
            EventService.Dispatch("vimeouploaderror", { message: `Unable to update video ${vimeoId} with name and description.`, error})
        });
    }

    /**
     * on method to add a listener. See config/config.ts for a list of available events
     * @param eventName
     * @param callback
     */
    public on(eventName: string, callback: any = null){
        if(!EventService.Exists(eventName)) return;
        if(callback === null){
            callback = EventService.GetDefault(eventName);
        }
        EventService.Add(eventName, callback);
    }

    /**
     * off method to remove a listener. See config/config.ts for a list of available events
     * @param eventName
     * @param callback
     */
    public off(eventName: string, callback: any = null){
        if(!EventService.Exists(eventName)) return;
        if(callback === null){
            callback = EventService.GetDefault(eventName);
        }
        EventService.Remove(eventName, callback)
    }

    /**
     * canContinue method checks to see if the amount of failCounts exceed the maxAcceptedFails
     * @returns {boolean}
     */
    private canContinue(): boolean {
        return (this.maxAcceptedFails === 0) ? true : (this.failCount <= this.maxAcceptedFails) ? true : false;
    }
    
}