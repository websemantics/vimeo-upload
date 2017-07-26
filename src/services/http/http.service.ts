import {Request} from "../../entities/request";
import {Header} from "../../entities/header";
import {Response} from "../../entities/response";
import {StatService} from "../stat/stat.service";
import {StatData} from "../../entities/stat_data";
import {TimeUtil} from "../../utils/utils";
import {Status} from "../../enums/status.enum";
/**
 * Created by kfaulhaber on 31/03/2017.
 */
    
    
export class HttpService {

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

        if(xhr.status >= 400){
            response.statusCode = Status.Rejected
        }
        
        return Response;
    }

    public send<T>(request: Request, statData: StatData = null, resolver: any = null): Promise<T>{
        return new Promise((resolve: any, reject: any) => {
            let xhr = new XMLHttpRequest();

            xhr.open(request.method, request.url, true);
            request.headers.forEach((header: Header)=> xhr.setRequestHeader(header.title, header.value));

            //TODO: Check if needed.
            window.addEventListener("uploadaborted", ()=>{
                xhr.abort();
            }, false);

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
                    case response.statusCode === Status.Neutral && resolver !== null:
                        resolver(xhr, response);

                        if(response.statusCode === Status.Resolved){
                            resolve(response);
                        }else{
                            reject(response);
                        }

                        break;
                    case response.statusCode === Status.Neutral && resolver === null:
                        if(xhr.status < 300){
                            resolve(response);
                        }else{
                            reject(response);
                        }
                        break;
                    default:
                        reject(response);
                }
            };

            xhr.onabort = () => {
                reject(new Response(xhr.status, xhr.statusText, xhr.response));
            };

            xhr.onerror = () => {
                reject(new Response(xhr.status, xhr.statusText, xhr.response || null));
            };

            if(statData != null){
                xhr.upload.addEventListener("progress", (data: ProgressEvent) => {
                    if(data.lengthComputable){
                        statData.loaded = data.loaded;
                        statData.total = data.total;
                        statData.end = new Date();

                        //TODO: Symplify this.
                        if(TimeUtil.TimeToSeconds(statData.end.getTime()-statData.start.getTime()) > statData.prefferedDuration*1.5){
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