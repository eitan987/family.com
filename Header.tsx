import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, User, Settings } from "lucide-react";
import { ModeToggle } from "@/components/theme/ModeToggle";
import { useEffect, useState } from "react";

export function Header() {
  const [familyName, setFamilyName] = useState("המשפחה שלי");
  const [userName, setUserName] = useState("משתמש");
  
  useEffect(() => {
    // Initial load
    loadUserData();
    
    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Create a custom event listener for our app
    window.addEventListener('familyDataChanged', loadUserData);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('familyDataChanged', loadUserData);
    };
  }, []);
  
  // Handle storage changes from other tabs/windows
  const handleStorageChange = (e: StorageEvent) => {
    if (e.key === "familyName" || e.key === "userName") {
      loadUserData();
    }
  };
  
  // Load user data from localStorage
  const loadUserData = () => {
    const savedFamilyName = localStorage.getItem("familyName");
    const savedUserName = localStorage.getItem("userName");
    
    if (savedFamilyName) {
      setFamilyName(savedFamilyName);
    }
    
    if (savedUserName) {
      setUserName(savedUserName);
    }
  };

  return (
    <header className="border-b bg-white dark:bg-gray-900 sticky top-0 z-10">
      <div className="flex h-16 items-center px-4 sm:px-6 lg:px-8 justify-between">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-semibold text-family-primary">ניהול משפחתי</h1>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
          </Button>
          <ModeToggle />
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">שלום, {userName}</p>
              <p className="text-xs text-muted-foreground">משפחת {familyName}</p>
            </div>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className="bg-family-primary text-white">
                <User className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  );
}
