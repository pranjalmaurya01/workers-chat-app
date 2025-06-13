import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function ({ messages }: { messages: any }) {
  return (
    <div
      className='flex-1 overflow-y-auto space-y-1.5 space-x-3 p-2'
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
            className={`min-w-[100px] max-w-xs lg:max-w-md px-2 py-2 rounded-lg ${
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
            <p className='text-sm p-0.5'>{message.message}</p>

            {message.sent && (
              <span
                className={`text-[10px] mt-1 flex justify-end ${
                  message.sent ? 'text-green-100' : 'text-gray-500'
                }`}
              >
                {message.deliveredTo.map((e: string, idx: number) => (
                  <Tooltip key={idx}>
                    <TooltipTrigger asChild>
                      <Avatar className='h-4 w-4'>
                        <AvatarFallback className='bg-gray-500'>
                          {e?.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{e}</TooltipContent>
                  </Tooltip>
                ))}
              </span>
            )}
            <div className='flex justify-end mt-0.5'>
              <p
                className={`text-[9px] ${
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
  );
}
