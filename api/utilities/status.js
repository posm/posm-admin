var fs = require('fs');
var statusUtility = {};
var status;

/**
 * Initialize status object that persists throughout application
 *
 */
statusUtility.init = function (){
    status = {initialized:false, error:false, msg: ''};
};

/**
 * Register a specific admin process
 * @param name
 * @param childProcesses - Array of child processes
 */
statusUtility.registerProcess = function (name, childProcesses) {
    if(!status[name]){
        status[name] = {initialized:false, error:false, msg: '', complete:false};
        // check for child processes
        if(childProcesses){
            childProcesses.forEach(function(n){
                status[name][n] = {initialized:false, error:false, msg: '', complete:false};
            });
        }
    }
};


/**
 * Update a parent (and child)  process
 * @param parent name
 * @param child name
 * @param obj
 */
statusUtility.update = function (parent, child, obj) {
    // update parent process object
    if(parent && !child.length) {
        if (status[parent]) {
            // get object properties
            Object.keys(obj).forEach(function (prop) {
                // set parent property values
                status[parent][prop] = obj[prop];
            });
        }
    }

    // update child process
    if(parent && child) {
        if (status[parent][child]) {
            // get object properties
            Object.keys(obj).forEach(function (prop) {
                // set parent property values
                status[parent][child][prop] = obj[prop];
            });
        }
    }

    // update global status object as apposed to a global status process object
    if (!parent.length && !child.length && obj) {
        Object.keys(obj).forEach(function (prop) {
            status[prop] = obj[prop];
        });
    }
};

/**
 * Reset a parent process
 * @param name
 * @param childProcesses
 */
statusUtility.resetProcess = function (name, childProcesses) {
    if(status[name]){
        status[name] = {initialized:false, error:false, msg: '', complete:false};
        // check for child processes
        if(childProcesses){
            childProcesses.forEach(function(n){
                status[name][n] = {initialized:false, error:false, msg: '', complete:false};
            });
        }
    }
};


/**
 * Get a specific processes status, if no process, just send the entire object
 * @param name
 * @returns {*}
 */
statusUtility.getStatus = function(name){
    return (name && status[name]) ? status[name] : status;
};

function writeStatusToDisk () {


}

module.exports = statusUtility;