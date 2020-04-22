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

# Build stage

# Use the image created in develop stage.
FROM komunitin-app-develop as komunitin-app-build

# Install dependencies.
RUN npm install

# Rebuild node-sass.
RUN npm rebuild node-sass

# Build App using the build script defined in package.json
RUN npm run build

# Production stage

# Use the latest stable Nginx HTTP server over Alpine Linux.
FROM nginx:stable-alpine
# Copy the built application from Build stage to nginx HTML folder.
COPY --from=komunitin-app-build /app/dist/pwa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


