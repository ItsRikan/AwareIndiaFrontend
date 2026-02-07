import React, { ImgHTMLAttributes, useState } from 'react';

interface ImgProps extends ImgHTMLAttributes<HTMLImageElement> {
  fallback?: string;
}

export function Img({ src, alt, className, fallback = '/placeholder.svg', onError, ...rest }: ImgProps) {
  const [currentSrc, setCurrentSrc] = useState<string | undefined>(src as string | undefined);

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      onError={(e) => {
        setCurrentSrc(fallback);
        if (onError) onError(e as any);
      }}
      {...rest}
    />
  );
}

export default Img;
