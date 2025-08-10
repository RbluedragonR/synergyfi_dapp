export function getPhantomDeepLinkUrl(): string {
  const dappUrl = document.URL;
  const encodedDappUrl = encodeURIComponent(dappUrl);
  const encodedDappRefUrl = encodeURIComponent(window.location.origin);

  const encodedUrl = `https://phantom.app/ul/browse/${encodedDappUrl}?ref=${encodedDappRefUrl}`;
  return encodedUrl;
}
