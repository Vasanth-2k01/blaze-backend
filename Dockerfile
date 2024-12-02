FROM ghcr.io/puppeteer/puppeteer:23.9.0

USER root

ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome-stable

RUN wget https://dl.google.com/linux/direct/google-chrome-stable_current_amd64.deb && \
    dpkg -i google-chrome-stable_current_amd64.deb || true && \
    apt-get install -f -y && \
    rm google-chrome-stable_current_amd64.deb

RUN ls /usr/bin/ && google-chrome-stable --version

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm i
COPY . .
CMD ["npm","start"]