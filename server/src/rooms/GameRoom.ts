import { Room, Client } from "colyseus";

import { StateHandler } from "./StateHandler";
import { Player } from "../entities/Player";

export class GameRoom extends Room<StateHandler> {
    maxClients = 512;

    onCreate (options) {
        this.setSimulationInterval(() => this.onUpdate());
        this.setState(new StateHandler());

        this.onMessage("pos", (client, message) => {
            const player: Player = this.state.players[client.sessionId];
            player.position.x = message.x
            player.position.y = message.y
            player.position.z = message.z
        });
    }

    onJoin (client) {
        const player = new Player();
        player.position.x = 0;
        player.position.y = 0;
        player.position.z = 0;

        this.state.players[client.sessionId] = player;
    }

    onUpdate () {
//        for (const sessionId in this.state.players) {
//            const player: Player = this.state.players[sessionId];
//            player.position.x += player.pressedKeys.x * 0.1;
//            player.position.z -= player.pressedKeys.y * 0.1;
//        }
    }

    onLeave (client: Client) {
        delete this.state.players[client.sessionId];
    }

    onDispose () {
    }

}
