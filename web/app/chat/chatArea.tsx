'use client';

import { createNewMessage } from '@/app/chat/messageInput';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarTrigger,
} from '@/components/ui/menubar';
import { axiosInstance } from '@/lib/utils';
import imageCompression from 'browser-image-compression';
import { MoreVertical } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import ImagePreview from './imagePreview';
import MessageInput from './messageInput';
import MessageList, { UserI } from './messageList';

const socketUrl = process.env.NEXT_PUBLIC_BASE_URL!;
const mediaSizeLimit = 5 * 1024 * 1024;
const imgCompressOpts = {
  maxSizeMB: 1,
  useWebWorker: true,
};

function scrollToEndChatArea() {
  setTimeout(() => {
    const msgList = document.querySelector('#messageList');

    if (!msgList) return;
    msgList.scroll(0, msgList.scrollHeight);
  }, 500);
}

export default function () {
  const searchParams = useSearchParams();
  const room = searchParams.get('room');
  const userName = searchParams.get('userName');
  const router = useRouter();

  useEffect(() => {
    if (!room || !userName) {
      router.replace('/');
      return;
    }
  }, []);

  const [messages, setMessages] = useState<any>([]);
  const [user, setUser] = useState<null | UserI>(null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isImgLoading, setImgLoading] = useState(false);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    `${socketUrl}/?room=${room}`,
    {
      onOpen: () => console.log('opened'),
      shouldReconnect: () => true,
    }
  );

  useEffect(() => {
    if (readyState === 1) {
      const userIDLocal = localStorage.getItem('USER_ID');
      if (userIDLocal) {
        sendJsonMessage({ type: 'userName', userName, userId: userIDLocal });
        return;
      }
      sendJsonMessage({ type: 'userName', userName });
    }
  }, [readyState]);

  useEffect(() => {
    const m = lastJsonMessage as any;

    if (m && m.type) {
      console.log(m);
      switch (m.type) {
        case 'user':
          const { id, userName } = m;
          localStorage.setItem('USER_ID', id);
          localStorage.setItem('USER_NAME', userName);
          setUser({ userId: id, userName: userName });
          break;

        case 'chat':
          setMessages((prev: any) => [...prev, m]);
          sendJsonMessage({
            type: 'ack',
            msgId: m.id,
            senderId: m.senderId,
            timestamp: new Date().toString(),
            msgTimestamp: m.timestamp,
          });

          scrollToEndChatArea();
          break;

        case 'online':
          setOnlineUsers(m.users);
          break;

        case 'ack':
          setMessages((prev) => {
            prev.forEach((e) => {
              if (e.id === m.msgId) {
                e.deliveredTo.push(m.deliveredTo);
              }
            });
            return [...prev];
          });
          break;

        case 'msgHistory':
          setMessages(m.msgs);
          scrollToEndChatArea();
          break;

        default:
      }
    }
  }, [lastJsonMessage]);

  const handlePaste = async (e: React.ClipboardEvent<HTMLInputElement>) => {
    const items = e.clipboardData.items;

    for (const item of items) {
      if (item.type.startsWith('text/plain')) {
        item?.getAsString((e) => {
          console.log(e);
          // const msgInp: HTMLInputElement | null =
          // document.querySelector('#msgInp');
          // if (!msgInp) return;
          // msgInp.change;
        });
        continue;
      }

      if (item.type.startsWith('image/')) {
        setImgLoading(true);
        const imageFile = item.getAsFile();
        if (imageFile && imageFile.size < mediaSizeLimit) {
          const compressedFile = await imageCompression(
            imageFile,
            imgCompressOpts
          );
          const blobUrl = URL.createObjectURL(compressedFile);
          setPreview(blobUrl);
          setFile(compressedFile);
        }
      }
    }
  };

  async function handleUpload() {
    if (!file) return;

    const fd = new FormData();
    fd.append('file', file);
    const res = await axiosInstance.post('/uploadMedia', fd, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    const newMsg = createNewMessage({ message: '', media: [res.data] });
    sendJsonMessage(newMsg);
    setMessages((prev: any) => [...prev, newMsg]);
    scrollToEndChatArea();
    setPreview(null);
    setFile(null);
  }

  return (
    <div className='flex-1 flex flex-col' onPaste={handlePaste}>
      {/* Chat Header */}
      <div className='bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between'>
        <div className='flex items-center'>
          <Avatar className='h-10 w-10'>
            <AvatarFallback>{userName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='ml-3'>
            <h2 className='font-medium text-gray-900'>
              <span>{userName}</span> |{' '}
              <span className='text-light'>{room}</span>
            </h2>
            <p className='text-sm text-gray-500'>
              {onlineUsers.length - 1 > 0
                ? `${onlineUsers.length - 1} Online`
                : ''}
            </p>
          </div>
        </div>

        <div className='flex space-x-2'>
          <Menubar asChild>
            <MenubarMenu>
              <MenubarTrigger>
                <MoreVertical className='h-5 w-5' />
              </MenubarTrigger>
              <MenubarContent>
                <MenubarItem
                  onClick={() => {
                    sendJsonMessage({ type: 'clearChat' });
                  }}
                >
                  Clear Chat
                </MenubarItem>
              </MenubarContent>
            </MenubarMenu>
          </Menubar>
        </div>
      </div>

      <MessageList messages={messages} user={user} />

      <MessageInput
        sendJsonMessage={sendJsonMessage}
        setMessages={setMessages}
      />
      <ImagePreview
        preview={preview}
        onUpload={handleUpload}
        onCancel={() => {
          setPreview(null);
          setFile(null);
        }}
      />
    </div>
  );
}
