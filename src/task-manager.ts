/// <reference path="../typings/globals/lodash/index.d.ts" />
/// <reference path="../typings/globals/screeps/index.d.ts" />

import {Task} from "./task";
import {TaskType} from "./task";
import {RoleType} from "./task";
import {TaskSubType} from "./task";
import {ResourceType} from "./task";
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

        let role : RoleType = creep.memory.role;
        switch(role) {
            default:
                return;

            case RoleType.Worker:
            case RoleType.MultiRole:
                this.assignTask_Work(creep, isRefueling);
                break;

            case RoleType.Courier:
                this.assignTask_Industry(creep, isRefueling);
                break;

            case RoleType.Miner:
            case RoleType.Carrier:
            case RoleType.Burrower:
                this.assignTask_Mining(creep, isRefueling);
                break;

            case RoleType.Extractor:
                this.assignTask_Extract(creep, isRefueling);
                break;
        }
    }

    export function assignTask_Work(creep: Creep, isRefueling: boolean) : void {
        let task : Task;
        let roomTasks : Task[] = Memory["rooms"][creep.room.name]["tasks"];

        if (isRefueling) {   

            task = _.head(
                _.sortBy(_.sortBy(_.filter(roomTasks, t => { return t.Type == TaskType.Energy && (t.Creeps == null || t.Creeps > 0)}),
                            t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y)}), 
                            t => { return t.Priority }));
            
            if (task != null) {
				this.giveTask(creep, task);
                return;
            }
                        
            task = _.head(_.sortBy(_.filter(roomTasks, 
                    t => { return t.SubType == TaskSubType.Pickup && t.Resource == ResourceType.Energy && (t.Creeps == null || t.Creeps > 0); }), 
                    t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }));
            
            if (task != null) {
				this.giveTask(creep, task);
                return;
            }

            task = _.head(_.sortBy(_.filter(roomTasks, 
                    t => { return t.Type == TaskType.Mine && t.Resource == ResourceType.Energy && (t.Creeps == null || t.Creeps > 0); }), 
                    t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }));

            if (task != null) {
				this.giveTask(creep, task);
                return;
            }        
        }         
    }

    export function assignTask_Industry(creep: Creep, isRefueling: boolean) : void {
        
    }

    export function assignTask_Mine(creep: Creep, isRefueling: boolean) : void {
        
    }

    export function assignTask_Extract(creep: Creep, isRefueling: boolean) : void {
        
    }            

    export function compileTasks(rmName: string) : void {

    }
        
}