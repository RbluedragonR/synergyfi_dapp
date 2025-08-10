import { getAddress } from '@ethersproject/address';

// returns the checksummed address if the address is valid, otherwise returns false
export function isAddress(value: string): string | false {
  try {
    return getAddress(value);
  } catch (error) {
    // catchException(error);
    return false;
  }
}

const toShortAddr = (address: string, length = 4): string => {
  if (address) {
    if (address.length > length * 2) {
      return `${address.substring(0, length + 2)}...${address.slice(-length)}`;
    } else {
      return address;
    }
  }
  return '';
};

// shorten the checksummed version of the input address to have 0x + 4 characters at start and end
export function shortenAddress(address: string, isShowChecksum = false, length = 4): string {
  //   const parsed = getAddress(address);
  if (isShowChecksum) {
    const addr = isAddress(address);
    if (addr) {
      address = addr;
    }
  }
  return toShortAddr(address, length);
}
