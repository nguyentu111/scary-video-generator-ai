"use client";
import { Button, ButtonProps } from "@/components/ui/button";
import { useAction } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";

interface ConnectYoutubeButtonProps extends Omit<ButtonProps, "children"> {
  children: (props: { isConnecting: boolean }) => React.ReactNode;
}

export function ConnectYoutubeButton({
  children,
  ...rest
}: ConnectYoutubeButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const getUrl = useAction(api.youtube.getAuthUrlAction);

  const handleConnectYouTube = async () => {
    setIsConnecting(true);
    try {
      window.location.href = await getUrl();
    } catch (error) {
      console.error("Failed to get YouTube auth URL:", error);
      toast.error(
        "Failed to connect to YouTube. Please try again." +
          (error as Error)?.message,
      );
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <Button disabled={isConnecting} onClick={handleConnectYouTube} {...rest}>
      {children({ isConnecting })}
    </Button>
  );
}
