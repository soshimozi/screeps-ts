import {GameManager} from './game-manager';
import {Task} from './task';
import {TaskType} from './task';

declare var module: any;

/*
* Singleton object. Since GameManager doesn't need multiple instances we can use it as singleton object.
*/
GameManager.globalBootstrap();

module.exports.loop = function() {

    let t : Task = new Task();
    t.Type = TaskType.Industry;


    // create sites here
    GameManager.loop();
}