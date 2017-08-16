import {DEFAULT_EVENTS} from "../../config/config";
/**
 * Created by kfaulhaber on 17/07/2017.
 *
 * EventService class
 *
 * Composed of static methods for handly events
 *
 */

export class EventService {

    /**
     * Add static method that registers a valid event name.
     * @param eventName
     * @param callback
     * @constructor
     */
    public static Add(eventName: string, callback: any){
        window.addEventListener(eventName, callback, false);
    }

    /**
     * Remove static method that unregisters a listener with a valid event name
     * @param eventName
     * @param callback
     * @constructor
     */
    public static Remove(eventName: string, callback: any){
        window.removeEventListener(eventName, callback, false);
    }

    /**
     * Dispatch static method that emits an event
     * @param eventName
     * @param data
     * @constructor
     */
    public static Dispatch(eventName: string, data: any = null){
        let customEvent = new CustomEvent(eventName, {detail: data});
        window.dispatchEvent(customEvent);
    }

    /**
     * Exists static method that checks if an event name is valid.
     * @param eventName
     * @returns {boolean}
     * @constructor
     */
    public static Exists(eventName: string): boolean{
        return DEFAULT_EVENTS.hasOwnProperty(eventName);
    }

    /**
     * GetDefault static method that returns the default handler for a given event.
     * @param eventName
     * @returns {any}
     * @constructor
     */
    public static GetDefault(eventName: string): any {
        return DEFAULT_EVENTS[eventName];
    }
}