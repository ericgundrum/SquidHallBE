import path from "path";
import http from "http";
import express from "express";
import cors from "cors";
import { Server } from "colyseus";

import { GameRoom } from "./rooms/GameRoom";

function setup(app: express.Application, server: http.Server) {
    const gameServer = new Server({
        pingInterval: 2000,
        pingMaxRetries: 5,
        server: server,
        express: app
    });
    gameServer.define("SquidHall", GameRoom)
        .filterBy(['title']);

    return app;
}

const static_dir = path.join(__dirname, "..", "..", "client", "dist");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(static_dir));

if (process.env.NODE_ENV === "production") {
    require('greenlock-express')
        .init({
            packageRoot: __dirname,
            configDir: "./greenlock.d",
            maintainerEmail: 'me@example.com',
            packageAgent: "squidhallmu" + "/" + "1.0",
            cluster: false,
    })
    .ready(function (glx) {
        // Serves on 80 and 443
        // Get's SSL certificates magically!
        glx.serveApp(setup(app, glx.httpsServer(undefined, app)));
    });
}
else {
    // development port
    const PORT = process.env.PORT || 2657;
    const server = http.createServer(app);

    setup(app, server);
    server.listen(PORT, () =>
        {
            console.log(`Listening on http://localhost:${PORT}`);
            console.log("Serving static files from \'" + static_dir + "\'.");
        });
}
