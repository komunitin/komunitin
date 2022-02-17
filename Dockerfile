# Dockerfile that builds 3 images komunitin-app-develop, komunitin-app-build and 
# komunitin-app-production from the komunitin app.


# Develop stage

# Use the latest official node image.
FROM node:14 as komunitin-app-develop
WORKDIR /app

# Install mkcert
RUN apt-get update && apt-get -y install libnss3-tools wget \
  && wget -O /usr/local/bin/mkcert https://github.com/FiloSottile/mkcert/releases/download/v1.4.3/mkcert-v1.4.3-linux-amd64 \
  && chmod a+x /usr/local/bin/mkcert \
  && mkcert -install

# Create self-signed certificates.
RUN mkdir -p tmp/certs && mkcert -cert-file tmp/certs/localhost.pem -key-file tmp/certs/localhost-key.pem localhost

# Copy just package.json so when there's no package changes we don't 
# need to update the install step.
COPY package*.json ./

# Install quasar framework
RUN npm install -g @quasar/cli

# Install dependencies.
RUN npm install

# Rebuild node-sass.
RUN npm rebuild node-sass

# Copy sources 
COPY . .

# Build stage

# Use the image created in develop stage.
FROM komunitin-app-develop as komunitin-app-build

# Set the build flavour. Allowed options are:
# QENV=mirage, QENV=local, QENV=demo, QENV=build
ARG QENV=build
ENV QENV=$QENV

# Build App using the quasar CLI app.
RUN quasar build -m pwa

# Production stage

# Use the latest stable Nginx HTTP server over Alpine Linux.
FROM nginx:stable-alpine
# Copy the built application from Build stage to nginx HTML folder.
COPY --from=komunitin-app-build /app/dist/pwa /usr/share/nginx/html
# Configure nginx so that load/refresh works with virtual routes
RUN rm /etc/nginx/conf.d/default.conf
COPY docker/localhost.conf /etc/nginx/conf.d/

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


