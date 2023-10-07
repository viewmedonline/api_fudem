## ubuntu 20.04 LTS node 10.19.0
FROM ubuntu:20.04

# Create app directory
WORKDIR /app

# install nodejs
RUN apt-get update && apt-get install -y curl && \
    curl -sL https://deb.nodesource.com/setup_10.x | bash - && \
    apt-get install -y nodejs

# install chromium
RUN apt-get install -y chromium-browser

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

EXPOSE 3001

CMD [ "npm", "start" ]
