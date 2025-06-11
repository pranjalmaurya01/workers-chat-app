import { Suspense } from 'react';
import WhatsAppChat from './main';

export default function () {
  return (
    <Suspense fallback={null}>
      <WhatsAppChat />
    </Suspense>
  );
}
