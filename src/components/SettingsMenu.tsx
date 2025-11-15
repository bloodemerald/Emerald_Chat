import { Pencil, Settings, Trash2, Download, FileJson } from "lucide-react";

interface SettingsMenuProps {
  onExportTxt?: () => void;
  onExportJson?: () => void;
  onClearChat?: () => void;
  onToggleSettings?: () => void;
}

export const SettingsMenu = ({
  onExportTxt,
  onExportJson,
  onClearChat,
  onToggleSettings
}: SettingsMenuProps) => {
  return (
    <div className="w-[200px] rounded-lg p-4 flex flex-col gap-2.5 bg-gradient-to-br from-[#242832] via-[#242832] to-[#251c28] shadow-xl">
      {/* Export Section */}
      <ul className="list-none flex flex-col gap-2 px-2.5">
        <li
          className="flex items-center text-[#7e8590] gap-2.5 transition-all duration-300 px-2 py-1 rounded-md cursor-pointer hover:bg-[#5353ff] hover:text-white hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99]"
          onClick={onExportTxt}
        >
          <Download className="w-5 h-5 transition-all duration-300" />
          <p className="font-semibold text-sm">Export TXT</p>
        </li>
        <li
          className="flex items-center text-[#7e8590] gap-2.5 transition-all duration-300 px-2 py-1 rounded-md cursor-pointer hover:bg-[#5353ff] hover:text-white hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99]"
          onClick={onExportJson}
        >
          <FileJson className="w-5 h-5 transition-all duration-300" />
          <p className="font-semibold text-sm">Export JSON</p>
        </li>
      </ul>

      <div className="border-t-[1.5px] border-[#42434a]" />

      {/* Settings Section */}
      <ul className="list-none flex flex-col gap-2 px-2.5">
        <li
          className="flex items-center text-[#7e8590] gap-2.5 transition-all duration-300 px-2 py-1 rounded-md cursor-pointer hover:bg-[#5353ff] hover:text-white hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99]"
          onClick={onToggleSettings}
        >
          <Settings className="w-5 h-5 transition-all duration-300" />
          <p className="font-semibold text-sm">Settings</p>
        </li>
        <li
          className="flex items-center text-[#7e8590] gap-2.5 transition-all duration-300 px-2 py-1 rounded-md cursor-pointer hover:bg-[#8e2a2a] hover:text-white hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99]"
          onClick={onClearChat}
        >
          <Trash2 className="w-5 h-5 transition-all duration-300" />
          <p className="font-semibold text-sm">Clear Chat</p>
        </li>
      </ul>

      <div className="border-t-[1.5px] border-[#42434a]" />

      {/* Info Section */}
      <ul className="list-none flex flex-col gap-2 px-2.5">
        <li className="flex items-center text-[#bd89ff] gap-2.5 transition-all duration-300 px-2 py-1 rounded-md cursor-pointer hover:bg-[rgba(56,45,71,0.836)] hover:translate-x-[1px] hover:-translate-y-[1px] active:scale-[0.99]">
          <Pencil className="w-5 h-5 transition-all duration-300" />
          <p className="font-semibold text-sm">About</p>
        </li>
      </ul>
    </div>
  );
};
