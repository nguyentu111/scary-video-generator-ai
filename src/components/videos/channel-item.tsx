"use client";
import { useModal } from "@/components/providers/modal-provider";
import CustomModal from "@/components/shared/custom-modal";
import { Button } from "@/components/ui/button";
import { useMutation } from "convex/react";
import { useState } from "react";
import { toast } from "sonner";
import { api } from "~/convex/_generated/api";
import { Doc } from "~/convex/_generated/dataModel";

export function ChannelItem({ channel }: { channel: Doc<"channels"> }) {
  const { setOpen, setClose } = useModal();
  const [isDeleting, setisDeleting] = useState(false);
  const mutateDelete = useMutation(api.channels.deleteChannel);

  const handleDelete = async () => {
    setisDeleting(true);
    try {
      await mutateDelete({ id: channel._id });
      toast.success("Delete channel successfully");
      setClose();
    } catch (error) {
      console.log(error);
    }
    setisDeleting(false);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <div>{channel.channelTitle}</div>
      <Button
        variant={"link"}
        onClick={() =>
          setOpen(
            <CustomModal title="Delete channel" subheading="">
              <div className="flex flex-col gap-2">
                <div className="">
                  Are you sure you want to delete the connection to this
                  channel?
                </div>
                <div className="ml-auto flex gap-2">
                  <Button onClick={() => setClose()}>Cancel</Button>
                  <Button
                    disabled={isDeleting}
                    variant={"secondary"}
                    onClick={handleDelete}
                    className="bg-purple-500 text-white hover:bg-purple-600"
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </CustomModal>,
          )
        }
      >
        Delete
      </Button>
    </div>
  );
}
