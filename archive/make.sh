#!/bin/env bash
#
# https://help.ubuntu.com/community/LiveCDCustomizationFromScratch

set -ex

TGT_OS_CODENAME=${TGT_OS_CODENAME:-focal}
TGT_ARCH=${TGT_ARCH:-amd64}

source /etc/lsb-release || true
if [ "${DISTRIB_ID}" != "Ubuntu" ] ; then
    echo "WARNING: expected to run on Ubuntu; misbehavior is likely."
fi

which realpath dirname basename chroot
which debootstrap mksquashfs mkisofs

script_d=$(realpath $(dirname "${0}"))
repo_d=$(realpath "${script_d}/..")
ARC_NAME=${ARC_NAME:-$(basename ${repo_d})}
TGT_D=$(realpath ${TGT_D:-${repo_d}/../${ARC_NAME}.arc})
chroot_d="${TGT_D}/chroot"

# verify TGT_D is not some other dir or exit
if [ ! -d "$chroot_d" ] && [ -d "$TGT_D" ] && [ "$(ls -A ${TGT_D})" ] ; then
    echo "TGT_D looks like it might contain unrelated files."
    echo "Remove it, empty it, or choose another TGT_D."
    echo "Stopping."
    exit
fi

# use `chroot` to create the ISO OS
mkdir -p "${chroot_d}"
pushd "${TGT_D}"
deb_cache="${TGT_D}"/cache
mkdir -p "${deb_cache}"
sudo debootstrap --cache-dir="${deb_cache}" --arch=$TGT_ARCH $TGT_OS_CODENAME "${chroot_d}"
#sudo cp /etc/hosts "${chroot_d}"/etc/hosts
sudo cp /etc/resolv.conf "${chroot_d}"/etc/resolv.conf
sudo cp /etc/apt/sources.list "${chroot_d}"/etc/apt/sources.list

install_OS_in_chroot="${chroot_d}"/install_OS_in_chroot.sh
cat > "${install_OS_in_chroot}" <<EOF
    mount none -t proc /proc
    mount none -t sysfs /sys
    mount none -t devpts /dev/pts
    export HOME=/root
    export LC_ALL=C
    apt update
    apt install -y dbus
    dbus-uuidgen > /var/lib/dbus/machine-id
    # skip '/sbin/initctl' commands; using systemd, not upstart
    apt update -y
    apt install -y \
        ubuntu-standard \
        casper lupin-casper \
        discover laptop-detect os-prober \
        linux-generic

    ### customization for Squid Hall
    apt install -y --no-install-recommends nodejs

    ### customization for autologin
    mkdir -p /etc/systemd/system/getty\@tty1.service.d

    ### block all login messages for default account
    touch /etc/skel/.hushlogin

    # clean up chroot
    rm /var/lib/dbus/machine-id
    apt clean
    rm -rf /tmp/*
    rm /etc/resolv.conf
    umount -lf /proc
    # umount -lf /sys ### does not exist?
    # umount -lf /dev/pts ### does not exist?
EOF
chmod +x "${install_OS_in_chroot}"
sudo chroot "${chroot_d}" /install_OS_in_chroot.sh
rm "${install_OS_in_chroot}"


# enable dhcp networking
sudo cp -u "${script_d}"/55-dhcp-init.yaml "${chroot_d}"/etc/netplan/

# enable console autologin
sudo cp -u "${script_d}"/getty_override.conf \
     "${chroot_d}"/etc/systemd/system/getty\@tty1.service.d/override.conf
sudo chmod +r "${chroot_d}"/etc/systemd/system/getty\@tty1.service.d/override.conf

# enable squidhallmu
system_d=etc/systemd/system
squidhallmu=squidhallmu.service
sudo cp -u "${repo_d}"/server/systemd/${squidhallmu} "${chroot_d}"/${system_d}/
sudo chmod +r "${chroot_d}"/${system_d}/${squidhallmu}
pushd "${chroot_d}"/${system_d}/multi-user.target.wants/
sudo ln -s ../${squidhallmu}
popd

#sudo chroot "${chroot_d}" systemtctl enable /etc/systemd/system/squidhallmu.service


# prepare ISO boot dirs
mkdir -p image/{casper,isolinux}
sudo cp -u "${chroot_d}"/boot/vmlinuz-*-generic image/casper/vmlinuz
cp -u "${chroot_d}"/boot/initrd.img-*-generic image/casper/initrd.lz
cp -u /usr/lib/ISOLINUX/isolinux.bin image/isolinux/
cp -u /usr/lib/syslinux/modules/bios/ldlinux.c32 image/isolinux/
cp -u "${script_d}"/isolinux.{cfg,txt} image/isolinux/

# create a manifest
sudo chroot "${chroot_d}" dpkg-query -W --showformat='${Package} ${Version}\n' | \
    sudo tee image/casper/filesystem.manifest
sudo cp -u image/casper/filesystem.manifest image/casper/filesystem.manifest-desktop
REMOVE='ubiquity ubiquity-frontend-gtk ubiquity-frontend-kde casper lupin-casper live-initramfs user-setup discover1 xresprobe os-prober libdebian-installer4'
for i in $REMOVE
do
    sudo sed -i "/${i}/d" image/casper/filesystem.manifest-desktop
done


# Compress the chroot
sudo rm image/casper/filesystem.squashfs || true
sudo mksquashfs "${chroot_d}" image/casper/filesystem.squashfs -e boot
printf $(sudo du -sx --block-size=1 "${chroot_d}" | cut -f1) > image/casper/filesystem.size

# Compress the repo
repo_squash=image/casper/$(basename "${repo_d}").squashfs
rm ${repo_squash}
mksquashfs "${repo_d}" ${repo_squash} -all-root -keep-as-directory


# Make the ISO image
sudo mkisofs \
     -quiet -r -V ${ARC_NAME} \
     -cache-inodes -J -l \
     -b isolinux/isolinux.bin \
     -c isolinux/boot.cat \
     -no-emul-boot -boot-load-size 4 -boot-info-table \
     -o "${TGT_D}"/${ARC_NAME}.iso \
     "${TGT_D}/image"


# Finish
popd
echo "--- Finished. Test it in qemu with a command such as
qemu-system-x86_64 --enable-kvm -cpu host -m 1g -boot d -cdrom ${ARC_NAME}.iso \
  -nic user,hostfwd=::8080-:80
"
