import {GameManager} from './game-manager';

declare var module: any;

/*
* Singleton object. Since GameManager doesn't need multiple instances we can use it as singleton object.
*/
GameManager.globalBootstrap();

module.exports.loop = function() {


    // create sites here
    GameManager.loop();
}