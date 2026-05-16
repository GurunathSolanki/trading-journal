import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatIndianNumber(num) {
  if (num === null || num === undefined || isNaN(num) || num === "") return num;

  const numStr = num.toString();
  const isNegative = numStr.startsWith('-');
  const absNumValue = Math.abs(parseFloat(num));
  const absNumStr = absNumValue.toString();
  const [integerPart, decimalPart] = absNumStr.split('.');

  // Handle Indian numbering system
  const lastThree = integerPart.slice(-3);
  const otherNumbers = integerPart.slice(0, -3);

  let formatted = lastThree;
  if (otherNumbers) {
    formatted = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + "," + lastThree;
  }

  const result = decimalPart ? formatted + "." + decimalPart : formatted;
  return isNegative ? "-" + result : result;
}