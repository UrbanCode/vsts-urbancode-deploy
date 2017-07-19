"use strict";
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.
exports.__esModule = true;
var tl = require("vsts-task-lib/task");
var path = require("path");
var fs = require("fs");
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
    try {
        var stats = fs.statSync(udClientPath);
    }
    catch (error) {
        onError('udclient location: ' + udClientPath + ' is not accessible: ' + error);
    }
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
function endsWith(str, end) {
    var index = str.indexOf(end);
    if (index == -1) {
        return false;
    }
    return index == str.length - end.length;
}
// based on the udClientPath location, figure out the jar path; it's laid out like this on disk:
// udclient     -- shell script
// udclient.cmd -- windows script
// udclient.jar -- actual jar both those scripts call into
function locateUdClientJar(udClientPath) {
    tl.debug('resolving udclient.jar from udClientPath: ' + udClientPath);
    try {
        var stats = fs.statSync(udClientPath);
        if (stats.isFile()) {
            if (udClientPath.endsWith('udclient.jar')) {
                return udClientPath;
            }
            else if (udClientPath.endsWith('udclient')) {
                return udClientPath + '.jar';
            }
            else if (udClientPath.endsWith('udclient.cmd')) {
                return udClientPath.substring(0, udClientPath.length - 3) + 'jar';
            }
        }
        else if (stats.isDirectory()) {
            return udClientPath + path.sep + 'udclient.jar';
        }
    }
    catch (error) {
        onError('unable to resolve udclient.jar from udClientPath: ' + udClientPath + ' ' + error);
    }
    onError('unable to resolve udclient.jar from udClientPath: ' + udClientPath);
}
var udClientJarPath = locateUdClientJar(udClientPath);
try {
    var stats = fs.statSync(udClientJarPath);
    if (stats.isFile()) {
        tl.debug('successfully resolved udclient.jar: ' + udClientJarPath);
    }
    else {
        onError('resolved udclient.jar: ' + udClientJarPath + ' is not a file.');
    }
}
catch (error) {
    onError('resolved udclient.jar: ' + udClientJarPath + ' is not a file. ' + error);
}
var javaHome = process.env.JAVA_HOME;
var javaLocation;
if (typeof javaHome == "undefined") {
    javaLocation = tl.which('java');
    tl.debug('JAVA_HOME environment variable is undefined, using java from PATH.');
}
else {
    tl.debug('using java from JAVA_HOME environment variable.');
    javaLocation = javaHome + path.sep + 'bin' + path.sep + 'java';
}
tl.debug('java location = ' + javaLocation);
function runUdClient(globalArgs, args) {
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
    if (globalArgs != null) {
        for (var i = 0; i < globalArgs.length; i++) {
            java.arg(globalArgs[i]);
        }
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
runUdClient(null, udClientCommandArgs);
