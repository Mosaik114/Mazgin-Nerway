'use client';

import dynamic from 'next/dynamic';
import type { ComponentProps } from 'react';
import type EssayInteractionBar from './EssayInteractionBar';

const EssayInteractionBarDynamic = dynamic(() => import('./EssayInteractionBar'), { ssr: false });

type Props = ComponentProps<typeof EssayInteractionBar>;

export default function EssayInteractionBarClient(props: Props) {
  return <EssayInteractionBarDynamic {...props} />;
}
