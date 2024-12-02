#!/bin/bash

# Install Chrome locally
mkdir -p ~/chrome-install
cd ~/chrome-install

# Download and install Chrome
curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb
ar x google-chrome-stable_current_amd64.deb
tar -xf data.tar.xz

# Move binaries to local bin
mkdir -p /opt/render/local/bin
cp -r ./opt/google/chrome/* /opt/render/local/bin/

# Add Chrome to PATH
echo 'export PATH=$PATH:/opt/render/local/bin' >> ~/.bashrc
source ~/.bashrc

# Cleanup
cd ~
rm -rf ~/chrome-install

which google-chrome

echo $PATH
/opt/render/local/bin/google-chrome --version
echo "Google Chrome installed in /opt/render/local/bin"
