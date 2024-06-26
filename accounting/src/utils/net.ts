import { config } from "../config"

export const fixUrl = (url: string) => {
  // Replace "localhost" with "host.docker.internal" if we're inside a docker container
  return (config.DOCKER) ? url.replace("localhost", "host.docker.internal") : url
}