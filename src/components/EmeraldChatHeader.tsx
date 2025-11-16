const EmeraldChatHeader = () => {
  return (
    <div className="flex items-center gap-2">
      {/* Emerald Gem Icon */}
      <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-lg flex items-center justify-center shadow-md shadow-emerald-200">
        <svg 
          viewBox="0 0 24 24" 
          fill="none" 
          className="w-5 h-5 text-white"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            d="M12 2L2 7L12 12L22 7L12 2Z" 
            fill="currentColor" 
            opacity="0.3"
          />
          <path 
            d="M2 17L12 22L22 17" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
          <path 
            d="M2 12L12 17L22 12" 
            stroke="currentColor" 
            strokeWidth="2" 
            strokeLinecap="round"
          />
        </svg>
      </div>
      
      {/* Text Logo */}
      <div className="flex flex-col -space-y-1">
        <span className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-emerald-500 bg-clip-text text-transparent tracking-tight">
          EMERALD
        </span>
        <span className="text-[10px] font-medium text-gray-500 tracking-wider uppercase">
          Chat
        </span>
      </div>
    </div>
  );
}

export default EmeraldChatHeader;
