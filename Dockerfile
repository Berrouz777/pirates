FROM node:22.17.0-alpine3.21

USER root
WORKDIR /var/www/html

# Add git
RUN apk add git mc

# Copy package json with list of dependencies
COPY package*.json ./

# Install build toolchain, install node deps and compile native add-ons
RUN npm install

# Copy dependencies to outer folder
RUN mkdir -p /dependencies && cp -r node_modules /dependencies

# Copy source files
COPY . .

# Set app serving to permissive / assigned
ENV HOST=0.0.0.0

# Run container as daemon process
CMD ["tail", "-f", "/dev/null"]
