'use client';

import ChatArea from './chat-area';
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
  return (
    <div className='flex h-screen bg-gray-100'>
      <ChatArea selectedChat={chats[0]} />
    </div>
  );
}
