import "./index.css";

import * as BABYLON from "../squidhall/libs/babylonjs/babylon.js";

import { client } from "./game/network";

// Re-using server-side types for networking
// This is optional, but highly recommended
import { StateHandler } from "../../server/src/rooms/StateHandler";
import { PressedKeys } from "../../server/src/entities/Player";

declare global {
    interface Window { BABYLON: any; scene: any; }
}

// Colyseus / Join Room
client.joinOrCreate<StateHandler>("SquidHall").then(room => {
    var BABYLON = window.BABYLON;
    var scene  = window.scene;

    const playerViews: {[id: string]: BABYLON.Mesh} = {};

    room.state.players.onAdd = function(player, key) {
        // create the player avatar, local or remote
        playerViews[key] = BABYLON.Mesh.CreateSphere("player "+key, 16, 0.5, scene);
        playerViews[key].material = new BABYLON.StandardMaterial("player skin", scene);
        playerViews[key].material.emissiveColor =
            new BABYLON.Color4((key.codePointAt(0)-64)/64,
                               (key.codePointAt(1)-64)/64,
                               (key.codePointAt(2)-64)/64,
                               1).scale(0.2);

        // position local player avatar at the camera
        if (key === room.sessionId) {
            let camera_position = scene.activeCamera.globalPosition;
            player.position.x = camera_position.x;
            player.position.y = camera_position.y;
            player.position.z = camera_position.z;
        }
        playerViews[key].setAbsolutePosition(player.position);
    };

    room.state.players.onChange = function(player, key) {
        playerViews[key].setAbsolutePosition(player.position);
    };

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key]);
        delete playerViews[key];
    };

    room.onStateChange((state) => {
//        console.log("New room state:", state.toJSON());
    });

    // Keyboard listeners
    const position = { x: 0, y: 0, z: 0 };
    window.addEventListener("keydown", function(e) {
        // report camera position as local player position
        // TASK: filter non-positional keycodes or find a better event
        let camera_position = scene.activeCamera.globalPosition;
        position.x = camera_position.x;
        position.y = camera_position.y;
        position.z = camera_position.z;
        room.send('pos', position);
    });
});
