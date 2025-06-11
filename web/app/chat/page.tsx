'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import ChatArea from './chat-area';
import UsersList from './users-list';

// Mock data
const chats = [
  {
    id: 1,
    name: 'John Doe',
    lastMessage: 'Hey, how are you doing?',
    time: '2:30 PM',
    unread: 2,
    avatar: '/placeholder.svg?height=40&width=40',
    online: true,
  },
  {
    id: 2,
    name: 'Sarah Wilson',
    lastMessage: 'Can we meet tomorrow?',
    time: '1:45 PM',
    unread: 0,
    avatar: '/placeholder.svg?height=40&width=40',
    online: false,
  },
  {
    id: 3,
    name: 'Team Group',
    lastMessage: 'Mike: Great work everyone!',
    time: '12:30 PM',
    unread: 5,
    avatar: '/placeholder.svg?height=40&width=40',
    online: false,
  },
  {
    id: 4,
    name: 'Mom',
    lastMessage: "Don't forget to call me",
    time: '11:20 AM',
    unread: 0,
    avatar: '/placeholder.svg?height=40&width=40',
    online: true,
  },
  {
    id: 5,
    name: 'Alex Chen',
    lastMessage: 'Thanks for the help!',
    time: 'Yesterday',
    unread: 0,
    avatar: '/placeholder.svg?height=40&width=40',
    online: false,
  },
];

export default function WhatsAppChat() {
  const [selectedChat, setSelectedChat] = useState(chats[0]);

  return (
    <div className='flex h-screen bg-gray-100'>
      {/* Sidebar */}
      <div className='w-1/3 bg-white border-r border-gray-200 flex flex-col'>
        {/* Header */}
        <div className='bg-gray-100 p-4 border-b border-gray-200'>
          <div className='flex items-center justify-between mb-4'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src='/placeholder.svg?height=40&width=40' />
              <AvatarFallback>Me</AvatarFallback>
            </Avatar>
            <div className='flex space-x-2'>
              <Button variant='ghost' size='sm'>
                <MoreVertical className='h-5 w-5' />
              </Button>
            </div>
          </div>
          <UsersList
            selectedChat={selectedChat}
            setSelectedChat={setSelectedChat}
          />
        </div>
      </div>

      <ChatArea selectedChat={selectedChat} />
    </div>
  );
}
