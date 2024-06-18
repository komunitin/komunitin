# Build image
FROM node:22 as komunitin-accounting

WORKDIR /app

# Install pnpm
RUN npm install -g pnpm

# Copy just package.json (and pnpm-lock.yaml) so when there's no package changes we don't
# need to redo the install step.
COPY package.json ./
COPY pnpm-lock.yaml ./

# Install dependencies.
RUN pnpm install

# Copy sources
COPY . .

# Build App
RUN pnpm run build

# Run accounting service
CMD ["pnpm", "start"]
