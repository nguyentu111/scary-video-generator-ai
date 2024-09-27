"use client";
import { sendSqsMessage } from "@/lib/sqs";
import { api } from "@/trpc/react";
import { FormEvent, FormEventHandler, useState } from "react";

import { toast } from "sonner";

export default function TestPage() {
  const [text, setText] = useState("");
  const { mutate, data } = api.chatgpt.splitContentToSegments.useMutation();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // await sendSqsMessage("ggg");
    await mutate({ text });
    toast("send ok");
  };
  return (
    <div>
      <form onSubmit={handleSubmit} className="">
        <textarea
          placeholder="text"
          onChange={(e) => setText(e.target.value)}
          className="min-w-[500px]"
        >
          {text}
        </textarea>
        <button>submit</button>
      </form>
      <pre>{data && JSON.stringify(JSON.parse(data))}</pre>
    </div>
  );
}
