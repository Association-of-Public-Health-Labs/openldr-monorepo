import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const extractMetadata = (content: string) => {
  const commentMatch = content.match(/<!--\s*showfacilities:(\w+)\s*-->/);
  return commentMatch ? commentMatch[1] === 'true' : false;
};

const extractMetadataFromContent = (content: string, metadata: string) => {
  const commentMatch = content.match(new RegExp(`<!--\\s*${metadata}:(\\w+)\\s*-->`));
  return commentMatch ? commentMatch[1] : false;
};

export { extractMetadata, extractMetadataFromContent };