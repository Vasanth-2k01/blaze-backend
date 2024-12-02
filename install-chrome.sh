#!/bin/bash

# Download the Chrome package
curl -O https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb

# Install the downloaded package (requires sudo)
sudo dpkg -i google-chrome-stable_current_amd64.deb

# Clean up the downloaded .deb file
rm google-chrome-stable_current_amd64.deb

# Print the Chrome version to verify installation
google-chrome --version
