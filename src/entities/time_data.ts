/**
 * Created by kfaulhaber on 24/07/2017.
 */

export class TimeData {
    constructor(
        public start: Date,
        public end: Date,
        public percent: number = 0,
        public done: boolean = false
    ){}
}