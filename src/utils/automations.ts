export function generateRandomId() {
  const now = new Date();
  const datePart =
    now.getFullYear().toString().slice(-2) +
    (now.getMonth() + 1).toString().padStart(2, "0") +
    now.getDate().toString().padStart(2, "0") +
    now.getHours().toString().padStart(2, "0") +
    now.getMinutes().toString().padStart(2, "0") +
    now.getSeconds().toString().padStart(2, "0");
  const randomPart = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0");
  return datePart + randomPart;
}

export function addressToUint8Array(address: string) {
  const cleanAddress = address.startsWith("0x") ? address.slice(2) : address;

  const hexPairs = cleanAddress.match(/.{1,2}/g);

  const uint8Array = new Uint8Array(hexPairs!.length);
  for (let i = 0; i < hexPairs!.length; i++) {
    uint8Array[i] = parseInt(hexPairs![i], 16);
  }

  return uint8Array;
}

export function addressToUint256(address: string) {
  const uint8Array = addressToUint8Array(address);
  let uint256 = BigInt(0);
  for (let i = 0; i < uint8Array.length; i++) {
    uint256 |= BigInt(uint8Array[i]) << BigInt(8 * (uint8Array.length - 1 - i));
  }
  return uint256;
}
