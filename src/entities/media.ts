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

    public toJSON(): Object {
        return {
            name:           this.name,
            description:    this.description
        }
    }
}