import {Hive} from "./hive";

export namespace CreepUtil {

    export function isBoosted(creep) : boolean {
        
        for (let b in creep.body) {
            if (creep.body[b].boost) {
                return true;
            }
        }
        
        return false;
    }
}