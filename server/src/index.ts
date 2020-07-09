import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";

import { GameRoom } from "./rooms/GameRoom";

export const port = process.env.PORT || 2657;
const static_dir = path.join(__dirname, "..", "..", "client", "dist");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(static_dir));

// Create HTTP & WebSocket servers
const server = http.createServer(app);
const gameServer = new Server({
    server: server,
    express: app
});
gameServer.define("SquidHall", GameRoom);

server.listen(port);
console.log(`Listening on ${ port }`);
console.log("Serving static files from \'" + static_dir + "\'.");
