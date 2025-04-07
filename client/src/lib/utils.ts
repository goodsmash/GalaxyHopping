import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Safely retrieve a value from localStorage with error handling
 */
const getLocalStorage = (key: string): any => {
  try {
    const value = window.localStorage.getItem(key);
    if (value === null) return null;
    return JSON.parse(value);
  } catch (error) {
    console.error(`Error retrieving ${key} from localStorage:`, error);
    return null;
  }
};

/**
 * Safely store a value in localStorage with error handling
 */
const setLocalStorage = (key: string, value: any): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error storing ${key} in localStorage:`, error);
  }
};

export { getLocalStorage, setLocalStorage };
