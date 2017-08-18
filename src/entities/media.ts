/**
 * Created by kfaulhaber on 20/07/2017.
 */

export class Media {

    /**
     * constructor
     * @param file
     * @param data
     * @param upgrade_to_1080
     */

    constructor(
        public file: File,
        public data: any,
        public upgrade_to_1080: boolean
    ){}
}