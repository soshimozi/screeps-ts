/// <reference path="../typings/globals/lodash/index.d.ts" />
/// <reference path="../typings/globals/screeps/index.d.ts" />

export namespace Hive {

    export function isPulse() : boolean {

        if (Game.cpu.bucket > 9000) {
            return Game.time % 5 == 0;
        } else if (Game.cpu.bucket > 7000) {
            return Game.time % 10 == 0;
        } else if (Game.cpu.bucket > 5000) {
            return Game.time % 15 == 0;
        } else if (Game.cpu.bucket > 3000) {
            return Game.time % 30 == 0;
        } else if (Game.cpu.bucket > 1000) {
            return Game.time % 40 == 0;
        } else if (Game.cpu.bucket <= 1000) {
            return Game.time % 60 == 0;
        }
    }

    export function moveReusePath(): number {

        if (Game.cpu.bucket > 9000) {
            return 8;
        } else if (Game.cpu.bucket > 7000) {
            return 11;
        } else if (Game.cpu.bucket > 5000) {
            return 15;
        } else if (Game.cpu.bucket > 3000) {
            return 30;
        } else if (Game.cpu.bucket > 1000) {
            return 40;
        } else if (Game.cpu.bucket <= 1000) {
            return 60;
        }        
    }

    export function clearDeadMemory(): void {
        
        // Clear dead creeps from Memory
        for (let n in Memory.creeps) {
            if (!Game.creeps[n]) {
                delete Memory.creeps[n];
            }
        }        
    }

    export function initMemory() : void {
        if (Memory["rooms"] == null) Memory["rooms"] = {};        
        
        for (let r in Game["rooms"]) {            
            if (Memory["rooms"][r] == null) Memory["rooms"][r] = {};            
            if (Memory["rooms"][r]["tasks"] == null) Memory["rooms"][r]["tasks"] = {};            
			Memory["rooms"][r]["population_balance"] = null;
			
        }
		
		Memory["spawn_requests"] = new Array();
		
		if (Memory["request"] == null) Memory["request"] = {};		
		if (Memory["options"] == null) Memory["options"] = { console: "on" };        
    }
}