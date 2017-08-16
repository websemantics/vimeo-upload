import {Request} from "../../entities/request";
import {Header} from "../../entities/header";
import {Response} from "../../entities/response";
import {StatData} from "../../entities/stat_data";
import {TimeUtil} from "../../utils/utils";
import {Status} from "../../enums/status.enum";
/**
 * Created by kfaulhaber on 31/03/2017.
 */
    
    
export class HttpService {

    /**
     * constructor
     * @param maxAcceptedUploadDuration
     */
    constructor(
        public maxAcceptedUploadDuration: number
    ){}


    /**
     * DefaultResolver that decides if the xhr response is valid, and sends custom Response
     * @param xhr
     * @returns {Response}
     * @constructor
     */
    public static DefaultResolver(xhr: XMLHttpRequest): Response {
        let data = null;

        try{
            data = JSON.parse(xhr.response);
        }catch(e){
            data = xhr.response;
        }

        let response = new Response(
            xhr.status,
            xhr.statusText,
            data
        );

        response.responseHeaders = xhr.getAllResponseHeaders().split("\r\n").filter((rawHeader: string) => {
            return rawHeader.length > 0;
        }).map((rawHeader: string)=>{
            let index = rawHeader.indexOf(":");
            return new Header(rawHeader.slice(0, index).trim(), rawHeader.slice(index+1).trim());
        });

        console.log(response.responseHeaders);

        if(xhr.status > 308){
            response.statusCode = Status.Rejected
        }else{
            response.statusCode = Status.Resolved
        }
        
        return response;
    }

    /**
     * send method that sets the headers, the different callbacks and sends a request with data.
     * @param request
     * @param statData
     * @returns {Promise<T>}
     */
    public send<T>(request: Request, statData: StatData = null): Promise<T>{
        return new Promise((resolve: any, reject: any) => {
            let xhr = new XMLHttpRequest();

            xhr.open(request.method, request.url, true);
            request.headers.forEach((header: Header)=> xhr.setRequestHeader(header.title, header.value));

            xhr.onload = () => {
                if(statData !== null){
                    statData.end = new Date();
                    statData.done = true;
                }

                let response = HttpService.DefaultResolver(xhr);


                switch(true){
                    case response.statusCode === Status.Resolved:
                        resolve(response);
                        break;
                    default:
                        reject(response);
                }
            };

            xhr.onabort = () => {
                reject(new Response(xhr.status, xhr.statusText, xhr.response));
            };

            xhr.onerror = () => {
                reject(new Response(xhr.status, xhr.statusText, xhr.response));
            };

            if(statData != null){
                xhr.upload.addEventListener("progress", (data: ProgressEvent) => {
                    if(data.lengthComputable){
                        statData.loaded = data.loaded;
                        statData.total = data.total;
                        statData.end = new Date();

                        //TODO: Symplify this.
                        if(TimeUtil.TimeToSeconds(statData.end.getTime()-statData.start.getTime()) > statData.prefferedDuration*2){
                            statData.loaded = 0;
                            statData.total = 0;
                            statData.done = true;
                            xhr.abort();
                        }
                    }
                });
            }

            try {
                xhr.send(request.data);
            } catch(e){
                console.error("An error occured while sending.", e);
            }

        });
    }

    /**
     * Method that takes raw information to build a Request object.
     * @param method
     * @param url
     * @param data
     * @param headers
     * @returns {Request}
     * @constructor
     */
    static CreateRequest(
        method: string,
        url: string,
        data: any = null,
        headers: any = null
    ): Request {

        let headerList: Header[] = [];
        for(let prop in headers){
            if(headers.hasOwnProperty(prop)){
                headerList.push(new Header(prop, headers[prop]));
            }
        }

        return new Request(method, url, data, headerList)
    }
    
}