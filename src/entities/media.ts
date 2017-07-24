/**
 * Created by kfaulhaber on 20/07/2017.
 */

export class Media {

    //TODO: Check to see if these default values are acceptable
    constructor(
        public name: string             = "",
        public description: string      = "",
        public file: File               = null,
        public upgrade_to_1080: boolean = false
    ){}
}