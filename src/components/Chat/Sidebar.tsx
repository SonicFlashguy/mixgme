import type React from 'react';
import { useScrollVisibility } from '../../hooks/useScrollVisibility';

type ChatMessage = {
  id: number;
  username: string;
  level: number;
  content: string;
  timestamp: string;
  isPartner?: boolean;
};

const mockMessages: ChatMessage[] = [
  { id: 1, username: 'Giddy', level: 24, content: 'Send it', timestamp: '00:13' },
  { id: 2, username: 'Snuff', level: 19, content: 'Im playing GOB I like you.', timestamp: '00:13' },
  { id: 3, username: 'mlansky', level: 31, content: 'im with u giddy', timestamp: '00:13' },
  { id: 4, username: 'beanos', level: 10, content: 'wheres the insiders from this morning', timestamp: '00:13' },
  { id: 5, username: 'beanos', level: 10, content: 'some lvl 6 called 100x deadass', timestamp: '00:13' },
  { id: 6, username: 'mlansky', level: 31, content: 'im finna start streaming giving away .1 sol every hour', timestamp: '00:13' },
  { id: 7, username: 'Snuff', level: 19, content: 'But your username didnt to itself. Sir GOBbling Deez Nuts', timestamp: '00:13' },
  { id: 8, username: 'notsquishxbt', level: 36, content: 'madhatter called it too lmao', timestamp: '00:13' },
  { id: 9, username: 'notsquishxbt', level: 36, content: 'he said banger coming', timestamp: '00:14' },
  { id: 10, username: 'notsquishxbt', level: 36, content: 'then 522x', timestamp: '00:14' },
  { id: 11, username: 'Dolphie', level: 10, content: 'charts cooking', timestamp: '00:14' },
  { id: 12, username: 'fatjeeter', level: 33, content: 'here comes the rugs lads', timestamp: '00:14' },
  { id: 13, username: 'fatjeeter', level: 33, content: 'oh dear', timestamp: '00:14' },
  { id: 14, username: 'fatjeeter', level: 33, content: 'might be time to head off', timestamp: '00:14' },
  { id: 15, username: 'ANt', level: 18, content: 'lol', timestamp: '00:14' },
  { id: 16, username: 'GOB', level: 51, content: 'Here\'s the giveaway you asked for', timestamp: '00:29', isPartner: true },
  { id: 17, username: 'GOB', level: 51, content: 'https://x.com/BlockChainGods_/status/1924983723713290297', timestamp: '00:29', isPartner: true },
  { id: 18, username: 'RancidPussy', level: 7, content: 'and smell them, report back and lemme know the flavor', timestamp: '00:29' },
  { id: 19, username: 'Zyzco', level: 19, content: 'my moms dead', timestamp: '00:29' },
  { id: 20, username: 'Zyzco', level: 19, content: '', timestamp: '00:29' },
];

const Sidebar: React.FC = () => {
  const scrollRef = useScrollVisibility();

  return (
    <div className="h-full flex flex-col bg-[#0e0c0d] overflow-hidden">
      <div className="flex items-center p-2 border-b border-border-light">
        <div className="flex items-center">
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          <span className="text-white font-medium">GLOBAL (232)</span>
        </div>
        <div className="ml-auto flex space-x-2">
          <a href="https://discord.gg/RugsDotFun" target="_blank" rel="noopener noreferrer">
            <div className="w-7 h-7 bg-gray-800 border border-border-light rounded-full flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 71 55"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M60.1045 4.8978C55.5792 2.8214 50.7265 1.2916 45.6527 0.41542C45.5603 0.39851 45.468 0.440769 45.4204 0.525289C44.7963 1.6353 44.105 3.0834 43.6209 4.2216C38.1637 3.4046 32.7345 3.4046 27.3892 4.2216C26.905 3.0581 26.1886 1.6353 25.5617 0.525289C25.5141 0.443589 25.4218 0.40133 25.3294 0.41542C20.2584 1.2888 15.4057 2.8186 10.8776 4.8978C10.8384 4.9147 10.8048 4.9429 10.7825 4.9795C1.57795 18.7309 -0.943561 32.1443 0.293408 45.3914C0.299005 45.4562 0.335386 45.5182 0.385761 45.5576C6.45866 50.0174 12.3413 52.7249 18.1147 54.5195C18.2071 54.5477 18.305 54.5139 18.3638 54.4378C19.7295 52.5728 20.9469 50.6063 21.9907 48.5383C22.0523 48.4172 21.9935 48.2735 21.8676 48.2256C19.9366 47.4931 18.0979 46.6 16.3292 45.5858C16.1893 45.5041 16.1781 45.304 16.3068 45.2082C16.679 44.9293 17.0513 44.6391 17.4067 44.3461C17.471 44.2926 17.5606 44.2813 17.6362 44.3151C29.2558 49.6202 41.8354 49.6202 53.3179 44.3151C53.3935 44.2785 53.4831 44.2898 53.5502 44.3433C53.9057 44.6363 54.2779 44.9293 54.6529 45.2082C54.7816 45.304 54.7732 45.5041 54.6333 45.5858C52.8646 46.6197 51.0259 47.4931 49.0921 48.2228C48.9662 48.2707 48.9102 48.4172 48.9718 48.5383C50.038 50.6034 51.2554 52.5699 52.5959 54.435C52.6519 54.5139 52.7526 54.5477 52.845 54.5195C58.6464 52.7249 64.529 50.0174 70.6019 45.5576C70.6551 45.5182 70.6887 45.459 70.6943 45.3942C72.1747 30.0791 68.2147 16.7757 60.1968 4.9823C60.1772 4.9429 60.1437 4.9147 60.1045 4.8978ZM23.7259 37.3253C20.2276 37.3253 17.3451 34.1136 17.3451 30.1693C17.3451 26.225 20.1717 23.0133 23.7259 23.0133C27.308 23.0133 30.1626 26.2532 30.1066 30.1693C30.1066 34.1136 27.28 37.3253 23.7259 37.3253ZM47.3178 37.3253C43.8196 37.3253 40.9371 34.1136 40.9371 30.1693C40.9371 26.225 43.7636 23.0133 47.3178 23.0133C50.9 23.0133 53.7545 26.2532 53.6986 30.1693C53.6986 34.1136 50.9 37.3253 47.3178 37.3253Z" fill="#ffffff"/>
              </svg>
            </div>
          </a>
          <a href="https://x.com/RugsDotFun" target="_blank" rel="noopener noreferrer">
            <div className="w-7 h-7 bg-gray-800 border border-border-light rounded-full flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#ffffff" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </div>
          </a>
          <a href="https://t.me/RugsDotFun" target="_blank" rel="noopener noreferrer">
            <div className="w-7 h-7 bg-gray-800 border border-border-light rounded-full flex items-center justify-center">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path fill="#ffffff" d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.318-.634.318l.227-3.21 5.84-5.27c.27-.24-.06-.372-.42-.132l-7.208 4.54-3.09-.956c-.67-.212-.69-.67.14-.994l12.09-4.57c.56-.2 1.1.134 1.51.793z"/>
              </svg>
            </div>
          </a>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-minimal p-2 space-y-2">
        {mockMessages.map((message) => (
          <div key={message.id} className="chat-message text-sm text-wrap">
            <div className="flex flex-wrap items-start gap-1">
              <span className={`font-bold ${message.isPartner ? 'text-yellow-500' : `text-gray-${300 + message.level * 20}`}`}>
                {message.level}{message.username}
              </span>
              {message.isPartner && (
                <span className="bg-yellow-600 bg-opacity-30 text-yellow-500 text-xs px-1 py-0.5 rounded">
                  PARTNER
                </span>
              )}
              <span className="text-gray-500 text-xs ml-auto">{message.timestamp}</span>
            </div>
            <div className="text-gray-300 break-words-all max-w-full">
              {message.content.startsWith('http') ? (
                <a 
                  href={message.content} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline break-all"
                >
                  {message.content}
                </a>
              ) : (
                message.content
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border-light flex items-center justify-center">
        <div className="text-gray-400 text-sm">
          Please connect wallet to chat
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
