FROM node:20.11.1-alpine3.19 AS fnl_base_image
ENV PORT 8082
ENV NODE_ENV production
WORKDIR /usr/src/app

# Install git to pull submodules
RUN apk update && apk upgrade --no-cache openssl libcrypto3 libssl3

COPY package*.json ./
RUN npm ci --only=production

# Copy application files
COPY  --chown=node:node . .

EXPOSE 8082
CMD [ "node", "./bin/www" ]
