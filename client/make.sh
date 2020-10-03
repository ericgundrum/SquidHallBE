#! /usr/bin/env sh
# make SquidHall clients
#
# `./make.sh` to populate 'dist/' with webpack bundles and squidhall assets
# `./make.sh sync` to also sync 'dist/' to aws s3

set -e

if [ $(which docker) ] && [ "$(id)" == *docker* ] ; then
    dk() { docker "$@" ; }
else
    dk() { sudo docker "$@" ; }
fi

if [ -z `which aws` ] && [ `which docker` ] ; then
    aws() { dk run -it --rm -v ~/.config/aws:/root/.aws -v $(pwd):/aws aws "$@" ; }
fi

if [ -z `which npx` ] && [ `which docker` ] ; then
    webpack() { dk run -it --rm -v `pwd`:/home/me node12 npx webpack "$@" ; }
else
    webpack() { npx webpack "$@"; }
fi

# bundle squidhall babylon objects
cd squidhall && ./buildall.sh && cd -

# bundle webpack files into 'dist/'
webpack --env.production

# copy favicon
rsync -t favicon.ico dist/

# copy squidhall root files
rsync -t squidhall/*.html dist/

# copy squidhall dirs
for d in audio css libs textures ; do
    rsync -tr squidhall/${d} dist/
done

# remove unused files
rm dist/audio/*.wav || true
rm -rf dist/libs/modules/content/ || true

# sync to aws with `make.sh sync`
if [ ${1} ] && [ ${1} == 'sync' ] ; then
    echo 'aws not configured'
#    aws --profile my_profile s3 sync dist/ s3://example.com/ --delete --storage-class REDUCED_REDUNDANCY
fi
