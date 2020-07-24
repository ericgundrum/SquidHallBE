import * as BABYLON from 'babylonjs/babylon.max';
import "./squidhall/libs/babylonjs/babylonjs.proceduralTextures.min.js"
import "./squidhall/libs/babylonjs/babylonjs.materials.min.js"
import "./squidhall/libs/babylonjs/loaders/babylonjs.loaders.min.js"
import "./squidhall/libs/babylonjs/babylon.gui.min.js"
//const BABYLON = require( "babylonjs" );
const SQUIDSPACE = require( "./squidhall/libs/squidspace.js" );
const SQUIDCOMMON = require( "./squidhall/libs/squidmods/squidcommon.js" );
const SquidHall = require( "./squidhall/libs/squidhall.js" );
window.SQUIDSPACE = SQUIDSPACE;
window.SQUIDCOMMON = SQUIDCOMMON;

const SQUIDDEBUG = require( "./squidhall/libs/squidmods/squiddebug.js" );
window.SQUIDDEBUG = SQUIDDEBUG;
import { flyCkbox, identCkbox, inspctCkbox, setupDebugBefore, setupDebugAfter, findObject }
from 'exports-loader?exports[]=flyCkbox&exports[]=identCkbox&exports[]=inspctCkbox&exports[]=setupDebugBefore&exports[]=setupDebugAfter&exports[]=findObject!./squidhall/libs/squidhalldebug.js';
window.flyCkbox = flyCkbox
window.identCkbox = identCkbox
window.inspctCkbox = inspctCkbox
window.setupDebugBefore = setupDebugBefore
window.setupDebugAfter = setupDebugAfter
window.findObject = findObject

const world = require( "./squidhall/libs/modules/world.js" );
window.world = world;

import hall from "./squidhall/libs/modules/hall.js";
import furniture from "./squidhall/libs/modules/furniture.js";

import { Client } from "colyseus.js";

// adjust websocket endpoint for server runtime environment
const EC2_HOSTNAME = 'ec2-18-222-3-245.us-east-2.compute.amazonaws.com';
const HOSTNAME = window.location.hostname.endsWith('amazonaws.com') ? EC2_HOSTNAME : window.location.hostname;
const PORT = process.env.NODE_ENV === 'production'
      ? window.location.port : 2657;
const PROTOCOL = window.location.protocol.replace("http", "ws");
const ENDPOINT = `${ PROTOCOL }//${ HOSTNAME }:${ PORT }`;

const client = new Client(ENDPOINT);

// Colyseus / Join Room
client.joinOrCreate("SquidHall").then(room => {
    var BABYLON = window.BABYLON;
    var scene  = window.scene;

    const playerViews = [];

    room.state.players.onAdd = function(player, key) {
        // position local player avatar at the camera
        if (key === room.sessionId) {
            let camera_position = scene.activeCamera.globalPosition;
            player.position.r = 0;
            player.position.x = camera_position.x;
            player.position.y = camera_position.y;
            player.position.z = camera_position.z;
        }

        // create the player avatar, local or remote
        let pos = new BABYLON.Vector3(player.position.x, player.position.y, player.position.z)
        playerViews[key] = SquidHall.makeAvatar(key, pos, new BABYLON.Vector3(0, player.position.r, 0), scene);
    };

    room.state.players.onChange = function(player, key) {
        playerViews[key].setAbsolutePosition(player.position);
        playerViews[key].rotation.y = player.position.r;
    };

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key]);
        delete playerViews[key];
    };

//    room.onStateChange((state) => {
//        console.log("New room state:", state.toJSON());
//    });

    // Keyboard listeners
    const position = { r: 0, x: 0, y: 0, z: 0 };
    window.addEventListener("keydown", function(e) {
        // report camera position as local player position
        // TASK: filter non-positional keycodes or find a better event
        let camera_position = scene.activeCamera.globalPosition;
        position.x = camera_position.x;
        position.y = camera_position.y;
        position.z = camera_position.z;
        position.r = scene.activeCamera.rotation.y - Math.PI;
        room.send('pos', position);
    });
});

window.welcomeMessage = {
    "title": "Welcome to Squid Hall - A VR re-creation of the TSB Arena",
    "text": "Your mouse controls the direction you are facing. " +
            "The arrow keys or the W, A, S, and D keys control movement forward/back, and left/right. " +
            "You can click on some of the objects to learn more about them.<br/><br/>" +
            "Click the close button or outside this message box to start."
};

SquidHall.makeWorld([hall, furniture], null, null, true);
