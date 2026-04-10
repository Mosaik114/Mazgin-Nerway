'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type AvatarUpload from './AvatarUpload';

const AvatarUploadDynamic = dynamic(() => import('./AvatarUpload'), { ssr: false });

type Props = ComponentProps<typeof AvatarUpload>;

export default function AvatarUploadClient(props: Props) {
  return <AvatarUploadDynamic {...props} />;
}
