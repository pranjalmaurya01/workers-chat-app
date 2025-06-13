'use client';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@radix-ui/react-tooltip';
import { RefreshCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import {
  adjectives,
  animals,
  colors,
  Config,
  names,
  NumberDictionary,
  uniqueNamesGenerator,
} from 'unique-names-generator';

const MIN_LENGTH_ROOM_NAME = 15;
const MIN_LENGTH_USERNAME = 8;

function generateUniqueNameNumber() {
  const numberDictionary = NumberDictionary.generate({
    min: 100000,
    max: 999999,
  });
  const config: Config = {
    dictionaries: [names, numberDictionary],
    separator: '-',
  };

  const characterName: string = uniqueNamesGenerator(config);
  return characterName;
}

function returnUniqueName() {
  const shortName = uniqueNamesGenerator({
    dictionaries: [adjectives, colors, animals],
    style: 'capital',
    separator: '',
  });

  if (shortName.length < MIN_LENGTH_ROOM_NAME) {
    return returnUniqueName();
  }

  return shortName;
}

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const [state, setState] = useState({ code: '' });
  const [userName, setUserName] = useState('');

  const router = useRouter();

  function createNewRoom() {
    setState((prev) => ({ ...prev, code: returnUniqueName() }));
  }

  useEffect(() => {
    const userID = localStorage.getItem('USER_ID');
    const userName = localStorage.getItem('USER_NAME');

    if (!userID || !userName || userName === 'null') {
      createNewRoom();
      setUserName(generateUniqueNameNumber());

      localStorage.removeItem('USER_ID');
      localStorage.removeItem('USER_NAME');

      return;
    }

    createNewRoom();
    setUserName(userName);
  }, []);

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Join a room</CardTitle>
          <CardDescription>
            Enter a room code or create a new room
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();

              if (
                state.code.length < MIN_LENGTH_ROOM_NAME ||
                userName.length < MIN_LENGTH_USERNAME
              ) {
                toast.error('Code too short', {});
              }
              router.push(`/chat?room=${state.code}&userName=${userName}`);
            }}
          >
            <div className='flex flex-col gap-6'>
              <div className='flex w-full max-w-sm items-end'>
                <div className='flex justify-between w-full'>
                  <div className='grid gap-1 w-full'>
                    <Label htmlFor='code'>Code</Label>
                    <Input
                      id='code'
                      required
                      className=''
                      value={state.code}
                      onChange={(e) => {
                        setState((prev) => ({ ...prev, code: e.target.value }));
                      }}
                    />
                  </div>
                </div>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type='button'
                      variant={'outline'}
                      onClick={() => {
                        createNewRoom();
                      }}
                    >
                      <RefreshCcw />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className='text-sm'>Generate New Room Code</p>
                  </TooltipContent>
                </Tooltip>
              </div>

              <div className='flex justify-between w-full'>
                <div className='grid gap-1 w-full'>
                  <Label htmlFor='userName'>Your Name</Label>
                  <Input
                    id='userName'
                    required
                    className=''
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                  />
                </div>
              </div>

              <div className='flex flex-col gap-3'>
                <div></div>
                <div>
                  <Button
                    type='submit'
                    className='w-full'
                    disabled={
                      state.code.length < MIN_LENGTH_ROOM_NAME ||
                      userName.length < MIN_LENGTH_USERNAME
                    }
                  >
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
