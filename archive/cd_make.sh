#! /usr/bin/env sh
#
# derived from script posted by Petr Pudlak as a comment to
# https://help.ubuntu.com/community/LiveCDCustomization
#
# usage: sudo <script> /path/to/base_image.iso

CD="${1:-kubuntu-9.04-desktop-i386.iso}"
# exit after any error:
set -e

which mkisofs mksquashfs tempfile sed

WDIR=`mktemp -d $PWD/kubuntu-remastered.XXXXXXXXXX`
ISO="$WDIR/${CD##*/}"
ISO="${ISO%.iso}-remastered-KDM.iso"
EXIT=""
function addExit {
    EXIT="$@ ; $EXIT"
    trap "$EXIT" EXIT HUP TERM INT QUIT
}
function mnt {
    local margs="$1" ; shift
    local mp="$WDIR/$1"
    for D in "$@" ; do
        mkdir -v -p "$WDIR/$D"
    done
    mount -v $margs "$mp"
    addExit "umount -v $mp"
}

# mount the CD image
mnt "-t auto $CD -o loop,ro" cd

# mount compressed filesystem
mnt "-t squashfs $WDIR/cd/casper/filesystem.squashfs -o ro,loop" sq

# create joined writable filesystem for the new CD
mnt "-t aufs -o br:$WDIR/cd-w=rw:$WDIR/cd=ro none" cd-u cd-w

# create joined writable filesystem for the new compressed squashfs filesystem
mnt "-t aufs -o br:$WDIR/sq-w=rw:$WDIR/sq=ro none" sq-u sq-w

echo ">>> Updating CD content"

(
    cd sq-u

    # DO YOUR CUSTOMIZATION STUFF HERE, CHROOT, MODIFY FILES, ETC.
    # ...
    # ...

)

echo ">>> Compressing filesystem"
mksquashfs $WDIR/sq-u/ $WDIR/cd-u/casper/filesystem.squashfs -noappend

echo ">>> Recomputing MD5 sums"
( cd $WDIR/cd-u && find . -type f -not -name md5sum.txt -not -path '*/isolinux/*' -print0 | xargs -0 -- md5sum > md5sum.txt )

echo ">>> Creating ISO image $ISO"
mkisofs \
    -V "Custom KUbuntu Live CD" \
    -r -cache-inodes -J -l \
    -b isolinux/isolinux.bin \
    -c isolinux/boot.cat \
    -no-emul-boot -boot-load-size 4 -boot-info-table \
    -o "$ISO" \
    $WDIR/cd-u

# The trap ... callbacks will unmount everything.
