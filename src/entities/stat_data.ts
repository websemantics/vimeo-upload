/**
 * Created by kfaulhaber on 24/07/2017.
 */

export class StatData {
    constructor(
        public start: Date,
        public end: Date,
        public loaded: number = 0,
        public total: number = 0,
        public done: boolean = false
    ){}
}