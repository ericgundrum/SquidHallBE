import { Client } from "colyseus.js";

const PROTOCOL = window.location.protocol.replace("http", "ws");

const ENDPOINT = (process.env.PORT) > 0
    ? `${ PROTOCOL }//${ window.location.hostname }:process.env.PORT` // port 80 on heroku or now
    : `${ PROTOCOL }//${ window.location.hostname }:2657` // port 2657 on localhost

export const client = new Client(ENDPOINT);
