/**
 * Simple functions for creating Social Media share links, based on networks.json file.
 * **/


interface SocialNetworkEntry {
  contact?: string,
  share?: string,
  label: string,
  translateLabel?: boolean
}

interface SocialNetwork {
  pattern: string,
  label: string,
  translateLabel: boolean
}

/**
 * Import data from networks.json file.
 */
import NetworksJSON from './networks.json';
const SocialNetworks = NetworksJSON as {[key: string]: SocialNetworkEntry};

/**
 * Filter the social networks array loaded from networks.json to provide a typed
 * lost of networks of either contact or share type.
 */
function getNetworks(type: "contact" | "share") : {[key: string] : SocialNetwork} {
  return Object.keys(NetworksJSON)
    .filter((key) => (SocialNetworks[key][type] !== undefined))
    .reduce((obj: {[key: string]: SocialNetwork}, key) => {
      const network = SocialNetworks[key];
      obj[key] = {
        pattern: network[type] as string,
        label: network.label,
        translateLabel: network.translateLabel ?? false
      }
      return obj;
    }, {})
}

/**
 * Dictionary of social networks for contact people.
 */
export const ContactNetworks = Object.freeze(getNetworks("contact"));

/**
 * Dictionary of social networks for share content.
 */
export const ShareNetworks = Object.freeze(getNetworks("share"));

/**
 * Create contact link.
 */
export function getContactUrl(network: SocialNetwork, name: string) : string {
  return network.pattern
    .replace("{name}", encodeURIComponent(name));
}

/**
 * Create share link.
 */
export function getShareUrl(network: SocialNetwork, url: string, title: string, text:string) : string {
  return network.pattern
    .replace("{url}", encodeURIComponent(url))
    .replace("{title}", encodeURIComponent(title))
    .replace("{text}", encodeURIComponent(text));
}

