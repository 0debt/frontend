import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDefaultAvatar(userId: string): string {
  return `https://api.dicebear.com/7.x/thumbs/svg?seed=${userId}`
}
