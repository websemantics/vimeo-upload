import {EventService} from "../event/event.service";
import {TimeUtil} from "../../utils/utils";
import {ChunkService} from "../chunk/chunk.service";
import {StatData} from "../../entities/stat_data";
/**
 * Created by Grimbode on 14/07/2017.
 */

export class StatService {

    public si: number = -1;
    public totalStatData: StatData;
    public chunkStatData: StatData;
    public previousTotalPercent: number = 0;
    constructor(
        public timeInterval: number,
        public chunkService: ChunkService
    ){}

    public start(){
        this.totalStatData = this.create(true);
        this.startInterval();
    }

    public create(isTotal: boolean = false): StatData {
        let date = new Date();
        let size = (isTotal) ? this.chunkService.mediaService.media.file.size : this.chunkService.size;
        let statData = new StatData(date, date, this.chunkService.preferredUploadDuration, 0, size);
        return statData;
    }

    public save(timeData: StatData){
        this.chunkStatData = timeData;
    }

    public estimateTimeLeft(statData: StatData): number {
        let nTime = Math.floor(new Date().getTime() - statData.start.getTime());
        let ratio = this.calculateRatio(statData.loaded, statData.total);
        return (ratio > 0) ? Math.floor(nTime*ratio): nTime;
    }

    public calculateRatio(loaded: number, total: number): number{
        return loaded/total;
    }

    public calculatePercent(loaded: number, total: number): number{
        return Math.floor(this.calculateRatio(loaded, total)*100);
    }

    public calculateUploadSpeed(seconds: number): number {
        return (seconds > 0) ? Math.floor(this.chunkStatData.total/seconds) : 0;
    }

    public updateTotal(){
        this.totalStatData.loaded += this.chunkStatData.total;
    }

    public startInterval(){
        if(this.si > -1){
            this.stop();
        }

        this.si = setInterval(()=>{


            let chunkPercent = this.calculatePercent(this.chunkStatData.loaded, this.chunkStatData.total);
            if(this.chunkStatData.done){
                this.updateTotal();
                this.chunkStatData.total = this.chunkStatData.loaded = 0;
                chunkPercent = 100;
            }

            this.totalStatData.end = this.chunkStatData.end;
            this.previousTotalPercent = Math.max(this.totalStatData.loaded + this.chunkStatData.loaded, this.previousTotalPercent);


            let totalPercent = this.calculatePercent(
                this.previousTotalPercent,
                this.totalStatData.total
            );

            let chunkTimeLeft = (!this.chunkStatData || this.chunkStatData.done) ? 0 : this.estimateTimeLeft(this.chunkStatData);
            let chunkSecondsLeft = TimeUtil.TimeToSeconds(chunkTimeLeft);
            let timeLeft = this.estimateTimeLeft(this.totalStatData);
            let secondsLeft = TimeUtil.TimeToSeconds(timeLeft);

            let uploadSpeed = this.calculateUploadSpeed(chunkSecondsLeft);

            EventService.Dispatch("estimatedtimechanged", {
                seconds: secondsLeft,
                timeFormat: TimeUtil.MilisecondsToString(timeLeft)
            });
            EventService.Dispatch("estimatedchunktimechanged", {
                seconds: chunkSecondsLeft,
                timeFormat: TimeUtil.MilisecondsToString(chunkTimeLeft)
            });


            EventService.Dispatch("chunkprogresschanged", chunkPercent);


            if(this.totalStatData.done){
                totalPercent = 100;
            }

            EventService.Dispatch("estimateduploadspeedchanged", uploadSpeed);
            EventService.Dispatch("totalprogresschanged", totalPercent);

        }, this.timeInterval)

    }

    public stop(){
        clearInterval(this.si);
    }

    public getChunkUploadDuration(): number{
        return TimeUtil.TimeToSeconds(this.chunkStatData.end.getTime() - this.chunkStatData.start.getTime());
    }

    public chunkIsOverPrefferedUploadTime(): boolean{
        return this.getChunkUploadDuration() >= this.chunkService.preferredUploadDuration*1.5;
    }
}