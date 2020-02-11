# Dockerfile that builds 3 images komunitin-app-develop, komunitin-app-build and 
# komunitin-app-production from the komunitin app.


# Develop stage

# Use the latest official node image with Alpine Linux.
FROM node:alpine as komunitin-app-develop
WORKDIR /app
COPY package*.json ./
# Install quasar framework
RUN yarn global add @quasar/cli
COPY . .


# Build stage

# Use the image created in develop stage.
FROM komunitin-app-develop as komunitin-app-build
RUN yarn
RUN quasar build -m pwa

# Production stage

# Use the latest stable Nginx HTTP server over Alpine Linux.
FROM nginx:stable-alpine
# Copy the built application from Build stage to nginx HTML folder.
COPY --from=komunitin-app-build /app/dist/pwa /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]


