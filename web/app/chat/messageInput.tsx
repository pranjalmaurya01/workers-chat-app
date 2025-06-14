import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, Paperclip, Send, Smile } from 'lucide-react';
import { useState } from 'react';
import { v7 as uuidv7 } from 'uuid';

export default function ({
  sendJsonMessage,
  setMessages,
}: {
  sendJsonMessage: (m: any) => void;
  setMessages: any;
}) {
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      const newMsg = createNewMessage({ message: messageInput });
      sendJsonMessage(newMsg);

      newMsg.sent = true;
      setMessages((prev: any) => [...prev, newMsg]);
      setMessageInput('');
    }
  };

  function createNewMessage({ message }: { message: string }) {
    return {
      id: uuidv7(),
      type: 'chat',
      senderName: localStorage.getItem('USER_NAME'),
      senderId: localStorage.getItem('USER_ID'),
      message: message,
      timestamp: new Date().toString(),
      sent: false,
      deliveredTo: [],
    };
  }

  return (
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
  );
}
