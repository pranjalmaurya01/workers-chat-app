import ChatArea from '@/app/chat/chatArea';
import { Suspense } from 'react';

export default function () {
  return (
    <div className='flex h-screen bg-gray-100'>
      <Suspense fallback={null}>
        <ChatArea />
      </Suspense>
    </div>
  );
}
