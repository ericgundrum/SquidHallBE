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
const title = window.document.title.length ? window.document.title : "~purgatory~";
client.joinOrCreate("SquidHall", { title: title }).then(room => {
    let BABYLON = window.BABYLON;
    let scene   = window.scene;
    let SquidHall = window.SquidHall;

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
