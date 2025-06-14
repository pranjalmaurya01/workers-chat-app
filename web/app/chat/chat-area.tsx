import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical, Phone, Video } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import MessageInput from './messageInput';
import MessageList from './messageList';

const socketUrl = process.env.NEXT_PUBLIC_BASE_URL!;

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
  const [user, setUser] = useState<null | { userId: string; userName: string }>(
    null
  );
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

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
          console.log();

          m.msgs.forEach((msg) => {
            if (msg.senderId === user?.userId) {
              msg.sent = true;
            }
          });
          setMessages(m.msgs);
          break;

        default:
      }
    }
  }, [lastJsonMessage]);

  return (
    <div className='flex-1 flex flex-col'>
      {/* Chat Header */}
      <div className='bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between'>
        <div className='flex items-center'>
          <Avatar className='h-10 w-10'>
            {/* <AvatarImage src={selectedChat.avatar || '/placeholder.svg'} /> */}
            <AvatarFallback>{room?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='ml-3'>
            <h2 className='font-medium text-gray-900'>{room}</h2>
            <p className='text-sm text-gray-500'>
              {onlineUsers.length - 1 > 0
                ? `${onlineUsers.length - 1} Online`
                : ''}
            </p>
          </div>
        </div>

        <div className='flex space-x-2'>
          <Button variant='ghost' size='sm'>
            <Video className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='sm'>
            <Phone className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='sm'>
            <MoreVertical className='h-5 w-5' />
          </Button>
        </div>
      </div>

      <MessageList messages={messages} />

      <MessageInput
        sendJsonMessage={sendJsonMessage}
        setMessages={setMessages}
      />
    </div>
  );
}
