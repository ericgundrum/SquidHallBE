import { Client } from "colyseus.js";

const PROTOCOL = window.location.protocol.replace("http", "ws");

const ENDPOINT = process.env.NODE_ENV === 'production'
    ? `${ PROTOCOL }//${ window.location.host }`
    : `${ PROTOCOL }//${ window.location.hostname }:2657` // client devServer separate from ws server

export const client = new Client(ENDPOINT);
