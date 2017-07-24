import {DEFAULT_EVENTS} from "../../config/config";
/**
 * Created by kfaulhaber on 17/07/2017.
 */

export class EventService {

    public static Add(eventName: string, callback: any){
        window.addEventListener(eventName, callback, false);
    }

    public static Remove(eventName: string, callback: any){
        window.removeEventListener(eventName, callback, false);
    }

    public static Dispatch(eventName: string, data: any = null){
        let customEvent = new CustomEvent(eventName, {detail: data});
        window.dispatchEvent(customEvent);
    }

    public static Exists(eventName: string): boolean{
        return DEFAULT_EVENTS.hasOwnProperty(eventName);
    }

    public static GetDefault(eventName: string): any {
        return DEFAULT_EVENTS[eventName];
    }
}