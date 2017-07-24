import {Request} from "../../entities/request";
import {Header} from "../../entities/header";
import {Response} from "../../entities/response";
import {EventService} from "../event/event.service";
/**
 * Created by kfaulhaber on 31/03/2017.
 */

export class HttpService {

    public request: Request;
    
    constructor(
        method: string,
        url: string,
        data: any = null,
        headers: any = null
    ){
        this.request = HttpService.CreateRequest(method, url, data, headers);
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

    public send<T>(emitOnProgress: boolean = false): Promise<T>{

        return new Promise((resolve: any, reject: any) => {
           let xhr = new XMLHttpRequest();

            xhr.open(this.request.method, this.request.url, true);
            this.request.headers.forEach((header: Header)=> xhr.setRequestHeader(header.title, header.value));

            window.addEventListener("uploadaborted", ()=>{
               xhr.abort();
            }, false);

            xhr.onload = () => {
                let end: Date = new Date();

                let data = null;

                try{
                    data = JSON.parse(xhr.response);
                }catch(e){
                    console.warn("Unable to parse xhr return response.");
                    data = xhr.response;
                }

                let response = new Response(
                    xhr.status,
                    xhr.statusText,
                    data
                );
                let date = new Date(null);
                response.duration = end.getTime() - this.request.startTime;

                switch(true){
                    case xhr.status >= 200 && xhr.status < 300:
                        resolve(response);
                        break;
                    case xhr.status === 308:
                        response.range = xhr.getResponseHeader("Range");
                        resolve(response);
                        break;
                    default:
                        reject(response);
                }
            };

            xhr.onerror = () => {
              reject(new Response(xhr.status, xhr.statusText, xhr.response || null));
            };

            if(emitOnProgress){
                xhr.upload.addEventListener("progress", (data: ProgressEvent) => {
                    if(data.lengthComputable){
                        let percent = Math.floor(data.loaded/data.total * 100);
                        EventService.Dispatch("chunkprogresschanged", percent);
                    }
                })
            }

            this.request.startTime = new Date().getTime();
            try {
                xhr.send(this.request.data );
            } catch(e){
                console.error("An error occured while sending.", e);
            }

        });
    }
}