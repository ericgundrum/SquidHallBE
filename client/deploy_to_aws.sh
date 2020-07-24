#! /usr/bin/env sh
# deploy to aws s3

set -x

bkt={'s3://squidhall'}

s3_cp() {
    aws s3 cp $@ --storage-class REDUCED_REDUNDANCY
    ;
}

s3_sync() {
    aws s3 sync $@ --storage-class REDUCED_REDUNDANCY
    ;
}

for f in `ls squidhall/*.html` ; do
    s3_cp squidhall/${f} ${bkt}/
    ;
done

for f in `ls squidhall/Gimble_*` ; do
    s3_cp squidhall/${f} ${bkt}/
    ;
done

for d in (( audio/ ; css/ ; libs/ ; textures/ )) ; do
    s3_sync squidhall/${d} ${bkt}/${d}
    ;
done

for f in `ls dist/*.bundle.js*` ; do
    s3_cp dist/${f} ${bkt}/
    ;
done

s3_cp dist/index.html ${bkt}/squidhalltest_mu.html
