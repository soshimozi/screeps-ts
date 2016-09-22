/// <reference path="../typings/globals/lodash/index.d.ts" />
/// <reference path="../typings/globals/screeps/index.d.ts" />

import {Task} from "./task";
import {TaskType} from "./task";
import {Hive} from "./hive";
import {CreepUtil} from "./creep-util";

export namespace TaskManager {
    
    export function randomName() : string {
        return "xxxxxx-xxxxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
                let r = Math.random()*16|0, v = c == "x" ? r : (r&0x3|0x8);
                return v.toString(16);
            });
    }

    export function addTask(rmName: string, incTask: Task) : void {
        /* Task format:
            type:       combat | work | mine | carry | energy | industry | wait
            subtype:    pickup | withdraw | deposit | harvest | upgrade | repair | dismantle | attack | defend | heal | wait            
            priority:   on a scale of 1-10; only competes with tasks of same type
            structure:  link | storage
            resource:   energy | mineral
			amount:		#
            id:         target gameobject id
            pos:        room position
            timer:      run for x ticks
            goal:       e.g. hp goal for repairing, amount to deposit, etc.
            creeps:     maximum # of creeps to run this task
         */

		 
        let index = incTask.Type.toString() + "-" + incTask.SubType.toString() + "-" 
            + "xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
            let r = Math.random()*16|0, v = c == "x" ? r : (r&0x3|0x8);
            return v.toString(16);
            });
		
        Memory["rooms"][rmName]["tasks"][index] = incTask;
	}

	export function giveTask(creep: Creep, task: Task) : void {        
        creep.memory.task = task;
		
		if (task.Creeps != null)
            task.Creeps -= 1;
	}

    export function returnTask(creep: Creep, task:Task) : void {

		if (task != null && task.Creeps != null)
			task.Creeps += 1;
	}

    export function assignTask(creep: Creep, isRefueling: boolean) : void {
        if (creep.memory.task != null && Object.keys(creep.memory.task).length > 0) {            
            return;
        }

        let roomTasks : Task[] = Memory["rooms"][creep.room.name]["tasks"];
		
		// Assign a boost if needed and available
		if (creep.ticksToLive > 1100 && !CreepUtil.isBoosted(creep) ) {

			let task = _.head(_.filter(roomTasks, 
			 	t => { return t.Type == TaskType.Boost && t.Role == creep.memory.role && t.SubRole == creep.memory.subrole; }));
			 if (task != null) {
			 	this.giveTask(creep, task);
			 	return;
			 }
		}
    }
        
}