export enum TaskType {
    Combat,
    Work,
    Mine,
    Carry,
    Energy,
    Industry,
    Boost,
    Wait
}

enum TaskSubType {
    Pickup,
    Withdraw,
    Deposit,
    Harvest,
    Upgrade,
    Repair,
    Dismantle,
    Attack,
    Defend,
    Heal,
    Wait
}

enum StructureType {
    Link,
    Storage
}

enum ResourceType {
    Energy,
    Mineral
}

export class Task {

    Role: String;
    SubRole: String;
    Type : TaskType;
    SubType : TaskSubType;
    Priority: number;
    Structure: StructureType; 
    Resource: ResourceType;
    Amount: number;
    Id: string;
    Pos: RoomPosition;
    Timer: number;
    Goal: number;
    Creeps: number; 
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
}


