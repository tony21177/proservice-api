FROM node:14

# Create app directory
WORKDIR /usr/src/app
# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./
RUN npm install

# Bundle app source
COPY . .
EXPOSE 80
RUN echo ${es_host}

ENTRYPOINT es_host=${es_host} NODE_TLS_REJECT_UNAUTHORIZED=0 opensearch_username=${opensearch_username} opensearch_password=${opensearch_password} ca_path=${ca_path} NODE_ENV=production node ./bin/www