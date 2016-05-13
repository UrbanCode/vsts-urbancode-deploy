// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
"use strict";
/// <reference path="../../definitions/node.d.ts"/>
/// <reference path="../../definitions/vsts-task-lib.d.ts" />
var tl = require('vsts-task-lib/task');
var path = require('path');
var onError = function (errMsg) {
    tl.error(errMsg);
    tl.exit(1);
};
var serverEndpoint = tl.getInput('serverEndpoint', true);
if (!serverEndpoint) {
    onError('The IBM UrbanCode Deploy Endpoint could not be found');
}
var serverEndpointUrl = tl.getEndpointUrl(serverEndpoint, false);
if (!serverEndpointUrl) {
    onError('The IBM UrbanCode Deploy Endpoint URL could not be found');
}
var serverEndpointAuth = tl.getEndpointAuthorization(serverEndpoint, false);
var username = serverEndpointAuth['parameters']['username'];
var password = serverEndpointAuth['parameters']['password'];
var token = null;
// if there is no username, then the password field is actually a token.
if (username == null || username.length == 0) {
    tl.debug('username not specified in serverEndpoint, using password as token');
    token = password;
}
var workingDir = tl.getInput('workingDirectory', true);
var udClientPath; // loaded below
var udClientLocation = tl.getInput('udClientLocation');
if (udClientLocation != tl.getVariable('build.sourcesDirectory')) {
    //custom tool location for udclient was specified
    tl.debug('udclient location specified explicitly by task: ' + udClientLocation);
    udClientPath = udClientLocation;
}
else {
    //check the path for udclient
    udClientPath = tl.which('udclient');
    if (udClientPath) {
        tl.debug('udclient location not specified explicitly, using PATH:' + udClientPath);
    }
    else {
        //tool location for udclient was not specified, and not on PATH, show error (and point to where to install tool).
        onError('udclient location is neither specifified explicitly nor found in the PATH. Install the udclient: ' + serverEndpointUrl + '/#tools and specify the install location in the task or add it to the PATH on the build agent machine.');
    }
}
// based on the udClientPath location, figure out the jar path; it's laid out like this on disk:
// udclient     -- shell script
// udclient.cmd -- windows script
// udclient.jar -- actual jar both those scripts call into
function locateUdClientJar(udClientPath) {
    // search backwards nearest path separator
    for (var i = udClientPath.length - 1; i > -1; i--) {
        if (udClientPath.charAt(i) == path.sep) {
            return udClientPath.substring(0, i + 1) + 'udclient.jar';
        }
    }
}
var udClientJarPath = locateUdClientJar(udClientPath);
//TODO add some error messages in case this is not set correctly
var javaHome = process.env.JAVA_HOME;
var javaLocation = javaHome + path.sep + 'bin' + path.sep + 'java';
function runUdClient(args) {
    var java = tl.createToolRunner(javaLocation);
    java.arg('-jar');
    java.arg(udClientJarPath);
    //udClient args
    java.arg('-weburl');
    java.arg(serverEndpointUrl);
    if (token == null) {
        java.arg('-username');
        java.arg(username);
        java.arg('-password');
        java.arg(password);
    }
    else {
        java.arg('-authtoken');
        java.arg(token);
    }
    for (var i = 0; i < args.length; i++) {
        java.arg(args[i]);
    }
    var execResult = java.execSync();
    if (execResult.code != tl.TaskResult.Succeeded) {
        tl.setResult(tl.TaskResult.Failed, execResult.error.message);
    }
}
//TODO -- all of the above is shared code; need to figure out how to actually share it
var udClientCommandArgs = tl.getDelimitedInput('udClientCommandArgs', '\n', true);
runUdClient(udClientCommandArgs);
