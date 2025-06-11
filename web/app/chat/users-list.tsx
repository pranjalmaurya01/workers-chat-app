import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useState } from 'react';

export const chats = [
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

export default function ({
  selectedChat,
  setSelectedChat,
}: {
  selectedChat: (typeof chats)[0];
  setSelectedChat: any;
}) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      <div className='relative'>
        <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4' />
        <Input
          placeholder='Search or start new chat'
          className='pl-10 bg-white'
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

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
    </>
  );
}
