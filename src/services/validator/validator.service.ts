/**
 * Created by kfaulhaber on 30/06/2017.
 */

export class ValidatorService {

    /**
     * constructor that takes in a list of supported video files
     * @param supportedFiles
     */
    constructor(
        public supportedFiles: string[]
    ){}

    /**
     * Method that takes a file and decides whether it's supported
     * @param file
     * @returns {boolean}
     */
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