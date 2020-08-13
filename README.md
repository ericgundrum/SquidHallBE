# Squid Hall Multi-User

This is a project setup to use BabylonJS 4.x with Colyseus 0.13.x.

<img src="screenshot.png?raw=true" />

## Pulling Sources with git submodules

This project uses [git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)
to acquire static assests from another repo.
Initial setup is more complicated than a simple git project.

To clone the repo

```
git clone --recurse-submodules -b deployable https://github.com/ericgundrum/SquidHallBE.git
```

Then, to make typical git commands automatically handle the repo submodules

```
git config submodule.recurse true
```

Be aware that many GUI git tools do not handle submodules properly.
Be prepared for some pain if you are unfamiliar with submodules and rely on GUI tools.

## Quick Start with Docker

Using a docker container for development encapsulates the dependencies described below.
It abstracts away platform idiosyncracies.
It also keeps the computer safe from rouge packages.

See [Docker-Desktop](https://www.docker.com/products/docker-desktop)
to learn about installing and using docker.

'dev.dk' defines a docker image suitable for development.
In a terminal window at the root of this repository, run these commands

```
# build docker image faster without context
cat dev.dk | docker build --build-arg uid=$UID -t node12 -

# run dev servers in the background
docker run -dit --rm -v `pwd`:/home/me -p 8080:8080 -p 2657:2657 node12 /home/me/run_dev_servers
```

Monitor the servers with a command such as `tail -f log/client.log`.
The first run will take several minutes for each server to install its dependencies.
Be patient.

Once the servers are running, access SquidHall with `http://localhost:8080`.

Other options are described in 'dev.dk'.

## Quick Start Production

The production server easily can be built and run in any posix environment where
`node` and `git` are available. From the root of the repo, run
`npm install && npm start`. This will install all dependencies (within the repo working dir),
build the client and server applications, and run the server.

The server listens on port 2657 unless environment variable ${PORT} is set to another value.

Note that this deployment touches no files outside of the repo working directory.
This deployment can be run entirely within a container such as the one created from `dev.dk`.

## AWS Deployment

Deployment to AWS improves performance and scaling flexibility, but it is a bit more complicated.

### Client
All client assets are static. They are deployed from 's3://squidhallvr.conzealand.com/'.
Executing 'client/make.sh' will compile the babylon files, the colyseus client files
and copy all files needed for the client runtime to 'client/dist'.

Executing 'client/make.sh sync' makes and copies files as above and then copies
everything in 'client/dist' to 's3://squidhallvr.conzealand.com/' where it is publically accessible.
This `sync` command requires the `aws-cli` tool be configured with credentials to the destination.

### Server
Colyseus server is deployed to an EC2 t2.micro instance running nodeJS v10 on Ubunutu Server 20.04.
The Colyseus server listens on port 80.

The server must have `git` and `npm` installed.
Currently the server is setup, updated and activated manually using these commands

Setup
```
sudo apt update
sudo apt upgrade -y
sudo apt install --assume-yes --auto-remove --no-install-recommends git npm
sudo reboot
git clone --depth=1 -b deployable_nz https://github.com/ericgundrum/SquidHallBE.git
cd SquidHallBE
npm run compile-server
sudo systemctl enable ${PWD}/server/systemd/squidhallmu.service
sudo systemctl link ${PWD}/server/systemd/squidhallmu_restart.service
sudo systemctl enable ${PWD}/server/systemd/squidhallmu_restart.timer
```

Update
```
cd SquidHallBE
git pull
sudo systemctl daemon-reload
sudo systemctl restart squidhallmu.service
```

Activation
```
sudo systemctl start squidhallmu.service
sudo systemctl start squidhallmu_restart.timer
```

The server restarts automatically once a day to clear the Hall of
all visitors at the time specified in 'server/quidhallmu_restart.timer'.
This has the added benefit of releasing any resources leaked by the nodeJS server.
Note that clients are not notified they have been kicked from the Hall;
the only way they know is that visible avatars are fozen in place.

Colyseus server log message are written to the system journal.
View them with a command such as
`sudo journalctl -u squidhallmu.service --since=-5m -f`.
More information can be gleaned from
[man journalctl](http://manpages.ubuntu.com/manpages/focal/en/man1/journalctl.1.html).

### Coordinating Access
The main user entry point is any of several root files at
http://squidhallvr.conzealand.com/

That URL opens an index file listing several rooms available without multi-user capabilities.

The multi-user main hall is
http://squidhallvr.conzealand.com/squidhall.html?name=Visitor

The url query string passes the client avatar's name to be displayed on the badge.
The query string may be left off to display no name on the avatar's badge.

The multi-user client must know how to find the multi-user server.
Currently the server's hostname is coded in 'client/index.js'
as `EC2_HOSTNAME`. Its value must be updated and the client rebuilt
if the colyseus server hostname changes.

## Tooling

If not using docker as described above, you will need nodeJS and `npm` to install project dependencies

- [Node.js 10.x+](https://nodejs.org/)
- [Webpack 4.x](https://github.com/webpack/webpack)
- [TypeScript 3.x](https://github.com/Microsoft/TypeScript)
- [BabylonJS 4.x](https://github.com/BabylonJS/Babylon.js)
- [Colyseus 0.13.x](https://github.com/colyseus/colyseus)

[![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
| [Live demo](https://squidhall.herokuapp.com/)

NodeJS v12 typically is used for development.
Deployment to AWS running nodeJS v10 on Ubuntu 20.04 worked without issue.

## How to Use without Docker
_While this workflow is expected to work, it is not maintained.
There could be problems with the `npm` scripts used in this way._

Inside this repository, there's two separate applications.
The client (babylonjs + colyseus client) and the server (nodejs + colyseus server).
Each needs npm dependencies installed before running.

### Client Application Manually

To be able to build the client application, enter the client folder and install its dependencies

```
cd client
npm install
npm start
```

This will compile the 'squidhall' Babylon files and then spawn the `webpack-dev-server`
listening on [http://localhost:8080](http://localhost:8080).


### Server Application Manually

For the development server, the steps are the same.

```
cd server
npm install
npm start
```

This will compile the Colyseus typescript files and then spawn a web socket server
listening on [ws://localhost:2657](ws://localhost:2657).

## Documentation

- [BabylonJS documentation](https://doc.babylonjs.com/)
- [Colyseus documentation](https://docs.colyseus.io/)

## License

Apache License 2.0
