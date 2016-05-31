"use strict";

// https://github.com/fieldpapers/fp-tasks/blob/1d69e72e08496908c306e633637d01db58538517/lib/spawn.js

const spawn = require("child_process").spawn;

module.exports = function spawnWithTimeout(command, args, options) {
    // create a new process group
    options.detached = true;

    const child = spawn.call(null, command, args, options);
    child.command = command;
    child.args = args;

    if (options.timeout > 0) {
        const killSignal = options && options.killSignal || "SIGTERM";

        let timeout = setTimeout(function() {
            child.stdout.destroy();
            child.stderr.destroy();

            try {
                process.kill(-child.pid, killSignal);
            } catch (err) {
                console.warn(err.stack);
            }
            timeout = null;
        }, options.timeout);

        child.on("exit", function() {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
        });
    }

    return child;
};