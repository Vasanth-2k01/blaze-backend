#!/bin/bash

# Install Chrome locally
mkdir -p ~/chrome-install
cd ~/chrome-install

# Download and install Chrome
curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xf data.tar.xz

# Move binaries to local bin
mkdir -p /usr/bin/google-chrome
cp -r ./opt/google/chrome/* /usr/bin/google-chrome/

# Add Chrome to PATH
echo 'export PATH=$PATH:/usr/bin/google-chrome' >> ~/.bashrc
source ~/.bashrc

# Cleanup
cd ~
rm -rf ~/chrome-install

echo "Google Chrome installed in /usr/bin/google-chrome"
