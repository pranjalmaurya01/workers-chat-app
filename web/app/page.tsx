'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Mic,
  MoreVertical,
  Paperclip,
  Phone,
  Search,
  Send,
  Smile,
  Video,
} from 'lucide-react';
import { useState } from 'react';

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

const messages = [
  {
    id: 1,
    text: 'Hey! How are you doing?',
    time: '2:25 PM',
    sent: false,
  },
  {
    id: 2,
    text: "I'm doing great! Just finished a big project at work. How about you?",
    time: '2:26 PM',
    sent: true,
  },
  {
    id: 3,
    text: "That's awesome! I'm good too. Want to grab coffee this weekend?",
    time: '2:27 PM',
    sent: false,
  },
  {
    id: 4,
    text: 'Saturday afternoon works for me. How about 3 PM at our usual place?',
    time: '2:28 PM',
    sent: true,
  },
  {
    id: 5,
    text: 'Perfect! See you then 😊',
    time: '2:30 PM',
    sent: false,
  },
];

export default function WhatsAppChat() {
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (messageInput.trim()) {
      // In a real app, you would send the message here
      console.log('Sending message:', messageInput);
      setMessageInput('');
    }
  };

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

          {/* Search */}
          <div className='relative'>
            <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
            <Input
              placeholder='Search or start new chat'
              className='pl-10 bg-white'
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Chat List */}
        <div className='flex-1 overflow-y-auto'>
          {filteredChats.map((chat) => (
            <div
              key={chat.id}
              className={`flex items-center p-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 ${
                selectedChat.id === chat.id ? 'bg-gray-50' : ''
              }`}
              onClick={() => setSelectedChat(chat)}
            >
              <div className='relative'>
                <Avatar className='h-12 w-12'>
                  <AvatarImage src={chat.avatar || '/placeholder.svg'} />
                  <AvatarFallback>{chat.name.charAt(0)}</AvatarFallback>
                </Avatar>
                {chat.online && (
                  <div className='absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white'></div>
                )}
              </div>

              <div className='ml-3 flex-1 min-w-0'>
                <div className='flex justify-between items-center'>
                  <h3 className='font-medium text-gray-900 truncate'>
                    {chat.name}
                  </h3>
                  <span className='text-xs text-gray-500'>{chat.time}</span>
                </div>
                <div className='flex justify-between items-center mt-1'>
                  <p className='text-sm text-gray-600 truncate'>
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className='bg-green-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center ml-2'>
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className='flex-1 flex flex-col'>
        {/* Chat Header */}
        <div className='bg-gray-100 p-4 border-b border-gray-200 flex items-center justify-between'>
          <div className='flex items-center'>
            <Avatar className='h-10 w-10'>
              <AvatarImage src={selectedChat.avatar || '/placeholder.svg'} />
              <AvatarFallback>{selectedChat.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className='ml-3'>
              <h2 className='font-medium text-gray-900'>{selectedChat.name}</h2>
              <p className='text-sm text-gray-500'>
                {selectedChat.online ? 'Online' : 'Last seen recently'}
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
          className='flex-1 overflow-y-auto p-4 space-y-4'
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fillRule='evenodd'%3E%3Cg fill='%23f0f0f0' fillOpacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundColor: '#e5ddd5',
          }}
        >
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sent ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.sent
                    ? 'bg-green-500 text-white'
                    : 'bg-white text-gray-900'
                } shadow-sm`}
              >
                <p className='text-sm'>{message.text}</p>
                <p
                  className={`text-xs mt-1 ${
                    message.sent ? 'text-green-100' : 'text-gray-500'
                  }`}
                >
                  {message.time}
                </p>
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
                className='bg-green-500 hover:bg-green-600 text-white rounded-full h-10 w-10 p-0'
              >
                <Send className='h-4 w-4' />
              </Button>
            ) : (
              <Button variant='ghost' size='sm'>
                <Mic className='h-5 w-5' />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
