/**
 * Created by Grimbode on 14/07/2017.
 */

export class TimerService {

    public start: Date;
    public chunkStart: Date;

    constructor(){}
    
    estimateChunkSecondsLeft(percent: number): number{
        let nSeconds = Math.floor(new Date().getTime() - this.chunkStart.getTime());
        let totalEstimatedDuration = Math.floor(nSeconds*100/percent);
        return totalEstimatedDuration-nSeconds;
    }
    estimateTotalSecondsLeft(percent: number, chunkSecondsLeft: number = 0){
        let nSeconds = Math.floor(new Date().getTime() - this.start.getTime());
        let totalEstimatedDuration = Math.floor(nSeconds*100/percent);
        let secondsLeft = totalEstimatedDuration - nSeconds - chunkSecondsLeft;
    }
}