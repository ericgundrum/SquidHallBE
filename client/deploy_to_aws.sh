#! /usr/bin/env sh
# deploy to aws s3

set -e

bkt='s3://squidhall'

aws() {
    sudo docker run -it --rm -v ~/.config/aws:/root/.aws -v $(pwd):/aws aws $@
}

s3_cp() {
    aws s3 cp $@ --storage-class REDUCED_REDUNDANCY
}

s3_sync() {
    aws s3 sync $@ --storage-class REDUCED_REDUNDANCY
}

for f in `ls squidhall/*.html` ; do
    s3_cp ${f} ${bkt}/
done

for f in `ls squidhall/Gimble_*` ; do
    s3_cp ${f} ${bkt}/
done

for d in audio/ css/ libs/ textures/ ; do
    s3_sync squidhall/${d} ${bkt}/${d}
done

for f in `ls dist/*.bundle.js*` ; do
    s3_cp ${f} ${bkt}/
done

s3_cp dist/index.html ${bkt}/squidhalltest_mu.html
