'use client';

/* eslint-disable @next/next/no-img-element -- used for blob/data/user-provided URLs and remote icon URLs that are not a good fit for the Next image optimizer. */

import type { ImgHTMLAttributes } from 'react';

type RawImageProps = Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'> & {
  src: string;
  alt: string;
};

export default function RawImage({
  alt,
  loading = 'lazy',
  decoding = 'async',
  ...props
}: RawImageProps) {
  return <img alt={alt} loading={loading} decoding={decoding} {...props} />;
}
