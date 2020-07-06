# BabylonJS + Colyseus: Multiplayer Boilerplate <a href="https://patreon.com/endel" title="Donate to this project using Patreon"><img src="https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fshieldsio-patreon.herokuapp.com%2Fendel&style=for-the-badge" alt="Patreon donate button"/></a>

This is a project setup to use BabylonJS 4.x with Colyseus 0.13.x.

<img src="screenshot.png?raw=true" />

## Quick Start with Docker

Using a docker container for development encapsulates the dependencies described below.
It abstracts away platform idiosyncracies.
It also keeps the computer safe from rouge npm packages.

See [Docker-Desktop](https://www.docker.com/products/docker-desktop)
to learn about installing and using docker.

'dev.dk' defines a docker image suitable for development.
In a terminal window at the root of this repository, run these commands

```
# build docker image faster without context
cat ../dev.dk | docker build --build-arg uid=$UID -t node12 -

# run servers in the background
docker run -dit --rm -v `pwd`:/home/me -p 8080:8080 -p 2657:2657 node12 /home/me/run
```

Monitor the servers with a command such as `tail -f log/client.log`.
The first run will take several minutes for each server to install its dependencies.
Be patient.

Once the servers are running, access SquidHall with `http://localhost:8080`.

Other options are described in 'dev.dk'.

## Tooling

If not using docker as described above, you will need nodeJS and `npm` to install project dependencies

- [Node.js 12.x+](https://nodejs.org/)
- [Webpack 4.x](https://github.com/webpack/webpack)
- [TypeScript 3.x](https://github.com/Microsoft/TypeScript)
- [BabylonJS 4.x](https://github.com/BabylonJS/Babylon.js)
- [Colyseus 0.13.x](https://github.com/colyseus/colyseus)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
| [Live demo](https://babylonjs-multiplayer.herokuapp.com/)

**Requires [NodeJS v12.0.0+](https://nodejs.org/en/download/)**

## How to Use without Docker

Inside this repository, there's two separate applications.
The client (babylonjs + colyseus client) and the server (nodejs + colyseus server).
Each needs npm dependencies installed before running.

### Client Application Manually

To be able to build the client application, you'll need to enter in the folder,
and install its dependencies first.

```
cd client
npm install
npm start
```

This will spawn the `webpack-dev-server`, listening on [http://localhost:8080](http://localhost:8080).


### Server Application Manually

For the server, the steps are exactly the same.

```
cd server
npm install
npm start
```

This will spawn a web socket server, listening on [ws://localhost:2657](ws://localhost:2657).

## Documentation

- [BabylonJS documentation](https://doc.babylonjs.com/)
- [Colyseus documentation](https://docs.colyseus.io/)

## License

Apache License 2.0
