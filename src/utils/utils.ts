/**
 * Created by kfaulhaber on 17/07/2017.
 */


export class TimeUtil {

    static TimeToSeconds(time: number): number {
        return time/1000;
    }

    static TimeToString(time: number): string {
            let date = new Date(null);
            date.setTime(time);
            return date.toISOString().substr(11, 8);
    }
}