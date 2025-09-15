export const DropdownMenu = ({ children }: { children: React.ReactNode }) => <div>{children}</div>;
export const DropdownMenuTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
export const DropdownMenuContent = ({ children }: { children: React.ReactNode }) => (
  <div className="bg-elev border border-border rounded-md p-2">{children}</div>
);
export const DropdownMenuItem = ({ children }: { children: React.ReactNode }) => (
  <div className="px-3 py-1.5 text-sm hover:bg-[#16161A] rounded">{children}</div>
);

