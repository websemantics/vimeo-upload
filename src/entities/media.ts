/**
 * Created by kfaulhaber on 20/07/2017.
 */

export class Media {

    /**
     * constructor
     * @param name
     * @param description
     * @param file
     * @param upgrade_to_1080
     * @param privacy
     */
    constructor(
        public name: string,
        public description: string,
        public file: File,
        public upgrade_to_1080: boolean,
        public privacy: boolean
    ){}

    /**
     * toJSON method that returns the JSON version of the Media.
     * @returns {{name: string, description: string, [privacy.view]: (string|string)}}
     */
    public toJSON(): Object {
        return {
            name:                   this.name,
            description:            this.description,
            'privacy.view':        (this.privacy) ? 'nobody' : 'anybody'
        }
    }
}