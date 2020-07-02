import "./index.css";

import * as BABYLON from "../squidhall/libs/babylonjs/babylon.js";
import Keycode from "keycode.js";

import { client } from "./game/network";

// Re-using server-side types for networking
// This is optional, but highly recommended
import { StateHandler } from "../../server/src/rooms/StateHandler";
import { PressedKeys } from "../../server/src/entities/Player";

import furniture from "../squidhall/libs/modules/furniture.js";
import pipelineEx from "../squidhall/libs/modules/pipelineex.js";

declare global {
    interface Window { BABYLON: any;  canvas: any; engine: any; scene: any; }
}
var BABYLON = window.BABYLON;

declare var SQUIDSPACE: any;
declare var SQUIDCOMMON: any;
declare var SquidHall: any;

SquidHall.makeWorld([furniture, pipelineEx]);
var canvas = window.canvas;
var engine = window.engine;
var scene  = window.scene;

// This creates and positions a free camera (non-mesh)
var camera = new BABYLON.FollowCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(canvas, true);

// Colyseus / Join Room
client.joinOrCreate<StateHandler>("game").then(room => {
    const playerViews: {[id: string]: BABYLON.Mesh} = {};

    room.state.players.onAdd = function(player, key) {
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        playerViews[key] = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

        // Move the sphere upward 1/2 its height
        playerViews[key].position.set(player.position.x, player.position.y, player.position.z);

        // Set camera to follow current player
        if (key === room.sessionId) {
            camera.setTarget(playerViews[key].position);
        }
    };

    room.state.players.onChange = function(player, key) {
        playerViews[key].position.set(player.position.x, player.position.y, player.position.z);
    };

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key]);
        delete playerViews[key];
    };

    room.onStateChange((state) => {
        console.log("New room state:", state.toJSON());
    });

    // Keyboard listeners
    const keyboard: PressedKeys = { x: 0, y: 0 };
    window.addEventListener("keydown", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = -1;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 1;
        } else if (e.which === Keycode.UP) {
            keyboard.y = -1;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = 1;
        }
        room.send('key', keyboard);
    });

    window.addEventListener("keyup", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.UP) {
            keyboard.y = 0;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = 0;
        }
        room.send('key', keyboard);
    });

    // Resize the engine on window resize
    window.addEventListener('resize', function() {
        engine.resize();
    });
});

// Scene render loop
engine.runRenderLoop(function() {
    scene.render();
});
