const SQUIDSPACE = require( "./squidhall/libs/squidspace.js" );
const SQUIDCOMMON = require( "./squidhall/libs/squidmods/squidcommon.js" );
const SquidHall = require( "./squidhall/libs/squidhall.js" );
window.SQUIDSPACE = SQUIDSPACE;
window.SQUIDCOMMON = SQUIDCOMMON;

let want_debug = false;
if (want_debug === true) {
    const SQUIDDEBUG = require( "./squidhall/libs/squidmods/squiddebug.js" );
    const SquidHallDebug = require( "./squidhall/libs/squidhalldebug.js" );
    window.SQUIDDEBUG = SQUIDDEBUG;
}

const world = require( "./squidhall/libs/modules/world.js" );
const content = require( "./squidhall/libs/modules/content.js" );
import hall from "./squidhall/libs/modules/hall.js";
import furniture from "./squidhall/libs/modules/furniture.js";

window.world = world;
window.content = content;

import { Client } from "colyseus.js";

const PROTOCOL = window.location.protocol.replace("http", "ws");
const ENDPOINT = process.env.NODE_ENV === 'production'
    ? `${ PROTOCOL }//${ window.location.host }`
    : `${ PROTOCOL }//${ window.location.hostname }:2657` // client devServer separate from ws server

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

SquidHall.makeWorld([hall, furniture]);
