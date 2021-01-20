# Dockerfile that builds 3 images komunitin-app-develop, komunitin-app-build and 
# komunitin-app-production from the komunitin app.


# Develop stage

# Use the latest official node image with Alpine Linux.
FROM node:13-alpine as komunitin-app-develop
WORKDIR /app
COPY package*.json ./
# Install quasar framework
RUN npm install -g @quasar/cli

COPY . .

# Install dependencies.
RUN npm install

# Rebuild node-sass.
RUN npm rebuild node-sass

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


