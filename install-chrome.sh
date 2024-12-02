#!/bin/bash

# Install Chrome locally
mkdir -p ~/chrome-install
cd ~/chrome-install

# Download and install Chrome
curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xf data.tar.xz

# Move binaries to local bin
mkdir -p ~/local/bin
cp -r ./opt/google/chrome/* ~/local/bin/

# Add Chrome to PATH
echo 'export PATH=$PATH:~/local/bin' >> ~/.bashrc
source ~/.bashrc

# Cleanup
cd ~
rm -rf ~/chrome-install

which google-chrome

echo "Google Chrome installed in ~/local/bin"
