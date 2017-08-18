/**
 * Created by kfaulhaber on 17/07/2017.
 */


export class TimeUtil {

    /**
     * TimeToSeconds method that converts miliseconds to seconds
     * @param time
     * @returns {number}
     * @constructor
     */
    static TimeToSeconds(time: number): number {
        return time/1000;
    }

    /**
     * TimeToString method that takes a time and converts it to a string.
     * @param time
     * @returns {string}
     * @constructor
     */
    static TimeToString(time: number): string {
            let date = new Date(null);
            date.setTime(time);
            return date.toISOString().substr(11, 8);
    }

    /**
     * MilisecondsToString method that converts miliseconds to a string time format. HH:MM:SS
     * @param miliseconds
     * @returns {string}
     * @constructor
     */
    static MilisecondsToString(miliseconds: number): string {
        let seconds = TimeUtil.TimeToSeconds(miliseconds);
        let date = new Date(null);
        date.setSeconds(seconds);
        return date.toISOString().substr(11, 8);
    }
}