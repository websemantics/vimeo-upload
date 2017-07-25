import {Request} from "../../entities/request";
import {Header} from "../../entities/header";
import {Response} from "../../entities/response";
import {StatService} from "../stat/stat.service";
/**
 * Created by kfaulhaber on 31/03/2017.
 */
    
    
export class HttpService {
    constructor(
        public statService: StatService
    ){}
    
    public send<T>(request: Request, emitProgress: boolean = false): Promise<T>{
        return new Promise((resolve: any, reject: any) => {
            let xhr = new XMLHttpRequest();

            let statData = this.statService.create();

            xhr.open(request.method, request.url, true);
            request.headers.forEach((header: Header)=> xhr.setRequestHeader(header.title, header.value));

            window.addEventListener("uploadaborted", ()=>{
                xhr.abort();
            }, false);

            xhr.onload = () => {
                let end: Date = new Date();
                statData.end = end;
                statData.done = true;

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

            if(emitProgress){
                this.statService.save(statData);
                xhr.upload.addEventListener("progress", (data: ProgressEvent) => {
                    if(data.lengthComputable){
                        statData.loaded = data.loaded;
                        statData.total = data.total;
                        statData.end = new Date();
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