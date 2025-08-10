import bronze from '@/assets/images/icon_medal_bonze.png';
import gold from '@/assets/images/icon_medal_gold.png';
import silver from '@/assets/images/icon_medal_silver.png';
import { SHARE_POST_UPLOAD } from '@/constants/links';
import { CHAIN_ID } from '@derivation-tech/context';
import html2canvas, { Options } from 'html2canvas';
import { axiosPost } from './axios';
import { getShareVerification } from './sharepnl';
export const getEarnRuleImg = (chainId?: CHAIN_ID): string => {
  try {
    return require(`@/assets/images/earningRules/${chainId}.png`);
  } catch (error) {
    return require(`@/assets/images/earningRules/81457.png`);
  }
};
export const exportAsImageDataURL = async (
  element: HTMLElement | null,
  html2canvasOptions?: Partial<Options>,
  quality = 0.7,
) => {
  if (element) {
    const canvas = await html2canvas(element, html2canvasOptions);
    const imageDataURL = canvas.toDataURL('image/jpeg', quality);
    return imageDataURL;
  }
};

export const exportAsImage = async (
  element: HTMLElement | null,
  imageFileName: string,
  html2canvasOptions?: Partial<Options>,
) => {
  const imageDataURL = await exportAsImageDataURL(element, html2canvasOptions);
  imageDataURL && downloadImage(imageDataURL, imageFileName);
};

export const downloadImage = (blob: string, fileName: string) => {
  const fakeLink = window.document.createElement('a');
  fakeLink.style.cssText = 'display:none;';
  fakeLink.download = fileName;

  fakeLink.href = blob;

  document.body.appendChild(fakeLink);
  fakeLink.click();
  if (document.body.contains(fakeLink)) {
    document.body.removeChild(fakeLink);
  }

  fakeLink.remove();
};

export const uploadImageAndGetId = async ({
  id,
  base64Data,
  timestamp,
  url = SHARE_POST_UPLOAD,
}: Parameters<typeof getShareVerification>[0] & { timestamp: number; url?: string }) => {
  // const verification = getShareVerification({
  //   id,
  //   base64Data,
  //   timestamp,
  // });

  const response = await axiosPost({
    url,
    data: {
      id,
      base64: base64Data,
      timestamp: timestamp.toString(),
      // verification,
    },
  });
  if (response.data.code !== 200) {
    throw new Error('uploadSharePnlImage response was not ok');
  }
  console.log('🚀 ~ uploadSharePnlImage created successfully!');
};

export const preload = (urls: string[], onload?: (ev: Event) => void) => {
  const images = [];
  for (let i = 0; i < urls.length; i++) {
    const image = new Image();
    image.src = urls[i];
    image.onload = (ev) => {
      onload?.(ev);
    };
    images.push(image);
  }
};
export const rankSrcList = [gold, silver, bronze];
