import {EventService} from "../event/event.service";
import {TimeUtil} from "../../utils/utils";
import {ChunkService} from "../chunk/chunk.service";
import {TimeData} from "../../entities/time_data";
/**
 * Created by Grimbode on 14/07/2017.
 */

export class TimerService {

    public si: number = -1;
    public totalTimeData: TimeData;
    public chunkTimeData: TimeData;

    constructor(
        public timeInterval: number,
        public chunkService: ChunkService
    ){}

    public start(){
        this.totalTimeData = this.create();
        this.startInterval();
    }

    public create(): TimeData {
        let date = new Date();
        let timeData = new TimeData(date, date);
        return timeData;
    }

    public save(timeData: TimeData){
        this.chunkTimeData = timeData;
    }

    public estimateTimeLeft(timeData: TimeData, offset: number = 0): number {
        let nTime = Math.floor(new Date().getTime() - timeData.start.getTime());
        let totalEstimatedDuration = Math.floor(nTime*100/timeData.percent);
        return totalEstimatedDuration - nTime - offset;
    }

    public startInterval(){
        if(this.si > -1){
            clearInterval(this.si);
        }

        this.si = setInterval(()=>{

            let chunkTimeLeft = (!this.chunkTimeData || this.chunkTimeData.done) ? 0 : this.estimateTimeLeft(this.chunkTimeData);
            let chunkSecondsLeft = TimeUtil.TimeToSeconds(chunkTimeLeft);
            let timeLeft = this.estimateTimeLeft(this.totalTimeData, chunkTimeLeft);
            let secondsLeft = TimeUtil.TimeToSeconds(timeLeft);

            EventService.Dispatch("estimatedtimechanged", {
                seconds: secondsLeft,
                timeFormat: TimeUtil.TimeToString(timeLeft)
            });

            EventService.Dispatch("estimatedchunktimechanged", {
                seconds: chunkSecondsLeft,
                timeFormat: TimeUtil.TimeToString(chunkTimeLeft)
            });

            EventService.Dispatch("chunkprogresschanged", this.chunkTimeData.percent);

            EventService.Dispatch("estimateduploadspeedchanged", this.chunkService.size/chunkSecondsLeft);

        }, this.timeInterval)

    }


    public getChunkUploadDuration(): number{
        return TimeUtil.TimeToSeconds(this.chunkTimeData.end.getTime() - this.chunkTimeData.start.getTime());
    }
}