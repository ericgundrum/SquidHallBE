#! /usr/bin/env sh
# make links
#
# link squidhall public assets into distribution dir

squid_link() { test -d $1 || ln -s ../squidhall/$1 ; }

PUBLIC=${PUBLIC:-"dist"}

mkdir -p ${PUBLIC} && cd ${PUBLIC}

squid_link audio
squid_link css
squid_link img
squid_link libs
squid_link textures
