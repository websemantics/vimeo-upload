/**
 * Created by kfaulhaber on 30/06/2017.
 */

export class ValidatorService {

    constructor(
        public supportedFiles: string[]
    ){}

    public isSupported(file: File) {
        let type = file.type;

        if(type.indexOf('/') === -1){
            console.warn(`Wrong type found (${type}).`);
            return false;
        }

        let split = type.split('/');

        if(split[0] !== "video"){
            console.warn(`Only videos are supported, ${type} given.`)
            return false;
        }

        return this.supportedFiles.includes(split[1]);
    }
}