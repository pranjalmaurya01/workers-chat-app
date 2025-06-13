import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Send,
  Smile,
  Video,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import useWebSocket from 'react-use-websocket';
import { v7 as uuidv7 } from 'uuid';
import { chats } from './users-list';

const socketUrl = process.env.NEXT_PUBLIC_BASE_URL!;

export default function ({
  selectedChat,
}: {
  selectedChat: (typeof chats)[0];
}) {
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

  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<any>([]);
  const [name, setName] = useState('');
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);

  const { sendJsonMessage, lastJsonMessage, readyState } = useWebSocket(
    socketUrl,
    {
      onOpen: () => console.log('opened'),
      shouldReconnect: (closeEvent) => true,
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
          setName(userName);
          break;

        case 'chat':
          setMessages((prev: any) => [...prev, m]);
          sendJsonMessage({
            type: 'delivered',
            msgId: m.id,
            senderId: m.senderId,
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

        default:
      }
    }
  }, [lastJsonMessage]);

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMsg = createNewMessage({ message: messageInput });
      sendJsonMessage(newMsg);

      newMsg.sent = true;
      setMessages((prev: any) => [...prev, newMsg]);
    }
  };

  function createNewMessage({ message }: { message: string }) {
    return {
      id: uuidv7(),
      type: 'chat',
      senderName: name,
      senderId: localStorage.getItem('USER_ID'),
      message: message,
      timeStamp: new Date().toString(),
      sent: false,
      deliveredTo: [],
    };
  }

  return (
    <div className='flex-1 flex flex-col'>
      {/* Chat Header */}
      <div className='bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between'>
        <div className='flex items-center'>
          <Avatar className='h-10 w-10'>
            {/* <AvatarImage src={selectedChat.avatar || '/placeholder.svg'} /> */}
            <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className='ml-3'>
            <h2 className='font-medium text-gray-900'>{selectedChat.name}</h2>
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

      {/* Messages */}
      <div
        className='flex-1 overflow-y-auto p-1 space-y-4'
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f0f0f0' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundColor: '#e5ddd5',
        }}
      >
        {messages.map((message, idx) => (
          <div
            key={idx}
            className={`flex ${message.sent ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-2 my-1 py-2 rounded-lg ${
                message.sent
                  ? 'bg-green-500 text-white'
                  : 'bg-white text-gray-900'
              } shadow-sm`}
            >
              {!message.sent && (
                <p className='text-[10px] font-extralight'>
                  {message.senderName}
                </p>
              )}
              <p className='text-sm p-1'>{message.message}</p>

              <p
                className={`text-[10px] mt-1 ${
                  message.sent ? 'text-green-100' : 'text-gray-500'
                }`}
              >
                {message.sent && message.deliveredTo.join(',')}
              </p>
              <div className='flex justify-end'>
                <p
                  className={`text-[9px] -m-1 ${
                    message.sent ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {new Date(message.timeStamp.toString()).toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className='bg-gray-100 p-4 border-t border-gray-200'>
        <div className='flex items-center space-x-2'>
          <Button variant='ghost' size='sm'>
            <Smile className='h-5 w-5' />
          </Button>
          <Button variant='ghost' size='sm'>
            <Paperclip className='h-5 w-5' />
          </Button>

          <div className='flex-1 relative'>
            <Input
              placeholder='Type a message'
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              className='pr-12'
            />
          </div>

          {messageInput.trim() ? (
            <Button
              onClick={handleSendMessage}
              className='bg-green-500 hover:bg-green-600 text-white rounded-full h-8 w-8 p-0'
            >
              <Send className='h-4 w-4' />
            </Button>
          ) : (
            <Button variant='ghost' size='sm' className='h-8 w-8'>
              <Mic className='h-5 w-5 p-0' />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
