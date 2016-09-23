/// <reference path="../typings/globals/lodash/index.d.ts" />
/// <reference path="../typings/globals/screeps/index.d.ts" />

import {Task} from "./task";
import {Hive} from "./hive";
import {CreepUtil} from "./creep-util";
import {Constants} from './constants';

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

			let task = _.head(_.sortBy(_.filter(roomTasks, 
			 	t => { return t.Type == Constants.TaskType_Boost && t.Role == creep.memory.role && t.SubRole == creep.memory.subrole; }),
                 t => { return  t.Priority; }));

			 if (task != null) {
			 	this.giveTask(creep, task);
			 	return;
			 }
		}

        let role : string = creep.memory.role;
        switch(role) {
            default:
                return;

            case Constants.RoleType_Worker:
            case Constants.RoleType_MultiRole:
                this.assignTask_Work(creep, isRefueling);
                break;

            case Constants.RoleType_Courier:
                this.assignTask_Industry(creep, isRefueling);
                break;

            case Constants.RoleType_Miner:
            case Constants.RoleType_Carrier:
            case Constants.RoleType_Burrower:
                this.assignTask_Mining(creep, isRefueling);
                break;

            case Constants.RoleType_Extractor:
                this.assignTask_Extract(creep, isRefueling);
                break;
        }
    }

    export function assignTask_Work(creep: Creep, isRefueling: boolean) : void {
        let task : Task = null;
        let roomTasks : Task[] = Memory["rooms"][creep.room.name]["tasks"];

        if (isRefueling) {   

            task = _.head(_.sortBy(_.sortBy(_.filter(roomTasks, 
                            t => { return t.Type == Constants.TaskType_Energy && (t.Creeps == null || t.Creeps > 0);}),
                            t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y);}), 
                            t => { return t.Priority; }));
            
            if (task != null) {
				this.giveTask(creep, task);
                return;
            }
                        
            task = _.head(_.sortBy(_.filter(roomTasks, 
                    t => { return t.SubType == Constants.TaskType_Pickup && t.Resource == RESOURCE_ENERGY && (t.Creeps == null || t.Creeps > 0); }), 
                    t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }));
            
            if (task != null) {
				this.giveTask(creep, task);
                return;
            }

            task = _.head(_.sortBy(_.filter(roomTasks, 
                    t => { return t.Type == Constants.TaskType_Mine && t.Resource == RESOURCE_ENERGY && (t.Creeps == null || t.Creeps > 0); }), 
                    t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }));

            if (task != null) {
				this.giveTask(creep, task);
                return;
            }        

        } else {

            if(creep.memory.subrole == Constants.RoleType_Repairer) {
                task = _.head(_.sortBy(_.sortBy(_.filter(roomTasks, 
                        t => { return t.Type == Constants.TaskType_Work && t.SubType == Constants.TaskType_Repair && (t.Creeps == null || t.Creeps > 0); }), 
                        t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }),
                        t => { return t.Priority}));
            } else if(creep.memory.subrole == Constants.RoleType_Upgrader) {

                task = _.head(_.sortBy(_.sortBy(_.filter(roomTasks,
                        t => { return t.Type == Constants.TaskType_Work && t.SubType == Constants.TaskType_Upgrade && (t.Creeps == null || t.Creeps > 0);}),
                        t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y)}),
                        t => { return t.Priority; }));                
            } else {
                
                task = _.head(_.sortBy(_.sortBy(_.filter(roomTasks,
                        t => { return t.Type == Constants.TaskType_Work && (t.Creeps == null || t.Creeps > 0);}),
                        t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y)}),
                        t => { return t.Priority; }));     
            }
        }         

        if(task == null) {
            task = new Task();
            task.Type = Constants.TaskType_Wait;
            task.SubType = Constants.TaskType_Wait;
            task.Timer = 10;
        }
        
        this.giveTask(creep, task);
    }

    export function assignTask_Industry(creep: Creep, isRefueling: boolean) : void {

        let task : Task = null;
        let roomTasks : Task[] = Memory["rooms"][creep.room.name]["tasks"];
        
        if( isRefueling ) {
            task = _.head(_.sortBy(_.sortBy(_.filter(roomTasks, 
                    t => { return t.Type == Constants.TaskType_Industry && t.SubType == Constants.TaskType_Withdraw && (t.Creeps == null || t.Creeps > 0); }), 
                    t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }),
                    t => { return t.Priority; }));

            if (task != null) {
                this.giveTask(creep, task);
                return;
            } 

        } else {

            let resources = _.sortBy(Object.keys(creep.carry), (c) => { return -creep.carry[c]; });
            let resource = Object.keys(resources).length > 0 ? resources[0] : RESOURCE_ENERGY;

            task = _.head(_.sortBy(_.sortBy(_.filter(roomTasks, 
                    t => { return t.Type == Constants.TaskType_Industry && t.SubType == Constants.TaskType_Deposit && t.Resource == resource && (t.Creeps == null || t.Creeps > 0); }), 
                    t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }),
                    t => { return t.Priority; }));

            if (task != null) {
                this.giveTask(creep, task);
                return;
            }

            if (creep.carry.energy != null) {

				task = _.head(_.sortBy(_.filter(roomTasks, 
						t => { return t.Type == Constants.TaskType_Carry && t.Resource == RESOURCE_ENERGY && (t.Creeps == null || t.Creeps > 0); }), 
						t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }));

				if (task != null) {
                    this.giveTask(creep, task);
					return;
				}
			} else if (Object.keys(creep.carry).length > 0) {
				task = _.head(_.sortBy(_.filter(roomTasks, 
						t => { return t.Type == Constants.TaskType_Carry && t.Resource == "mineral" && (t.Creeps == null || t.Creeps > 0); }), 
						t => { return creep.pos.getRangeTo(t.Pos.x, t.Pos.y); }));

				if (task != null) {
                    this.giveTask(creep, task);
					return;
				}            
            }
        }

        if(task == null) {
            task = new Task();
            task.Type = Constants.TaskType_Wait;
            task.SubType =Constants.TaskType_Wait;
            task.Timer = 10;
        }
        
        this.giveTask(creep, task);        
    }

    export function assignTask_Mine(creep: Creep, isRefueling: boolean) : void {
        let task : Task = null;
        let roomTasks : Task[] = Memory["rooms"][creep.room.name]["tasks"];


        if(task == null) {
            task = new Task();
            task.Type = Constants.TaskType_Wait;
            task.SubType = Constants.TaskType_Wait;
            task.Timer = 10;
        }
        
        this.giveTask(creep, task);           
        
    }

    export function assignTask_Extract(creep: Creep, isRefueling: boolean) : void {
        let task : Task = null;
        let roomTasks : Task[] = Memory["rooms"][creep.room.name]["tasks"];


        if(task == null) {
            task = new Task();
            task.Type = Constants.TaskType_Wait;
            task.SubType = Constants.TaskType_Wait;
            task.Timer = 10;
        }
        
        this.giveTask(creep, task);             
    }            

    export function compileTasks(rmName: string) : void {

    }
        
}