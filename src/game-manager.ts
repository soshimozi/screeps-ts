import {Hive} from "./hive";

export namespace GameManager {

    export function globalBootstrap() : void {

    }

    export function loop() : void {

        Hive.clearDeadMemory();
    }
}