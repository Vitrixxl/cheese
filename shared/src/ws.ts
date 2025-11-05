import { User } from "@shared/entity";
import { count } from "console";
import { ElysiaWS } from "elysia/ws";

const textDecoder = new TextDecoder();

type RawPayload = string | ArrayBuffer | ArrayBufferView | Blob;

export type Envelope<T = unknown> = {
  key: string;
  payload: T;
};

export type Envelopes = Record<string, unknown>;

export class Socket<R extends Envelopes, W extends Envelopes> {
  constructor() {}
}

export type LocalSocket<WriteEnvelope extends Envelopes> = {
  send: <K extends keyof WriteEnvelope>(
    key: K,
    payload: WriteEnvelope[K],
  ) => void;
};

export type SocketParams<
  ReadEnvelopes extends Envelopes,
  WriteEnvelopes extends Envelopes,
> = {
  on: {
    [K in keyof ReadEnvelopes]: ({
      payload,
      userId,
    }: {
      payload: ReadEnvelopes[K];
      userId: User["id"];
    }) => void | Promise<void>;
  };
  onOpen?: (ws: LocalSocket<WriteEnvelopes>) => void | Promise<void>;
  onClose?: (
    ws: LocalSocket<WriteEnvelopes>,
    code: number,
    reason?: string,
  ) => void | Promise<void>;
};

const wrapServerSocket = <WriteEnvelopes extends Envelopes>(
  ws: ElysiaWS,
): LocalSocket<WriteEnvelopes> => ({
  send: (key, payload) => {
    ws.send(
      JSON.stringify({
        key,
        payload,
      }),
    );
  },
});

const decodePayload = async (payload: RawPayload): Promise<string | null> => {
  if (typeof payload === "string") return payload;

  if (payload instanceof ArrayBuffer) {
    return textDecoder.decode(payload);
  }

  if (ArrayBuffer.isView(payload)) {
    return textDecoder.decode(
      payload.buffer.slice(
        payload.byteOffset,
        payload.byteOffset + payload.byteLength,
      ),
    );
  }

  if (typeof Blob !== "undefined" && payload instanceof Blob) {
    return payload.text();
  }

  return null;
};

const parseEnvelope = (message: string | null): Envelope | null => {
  if (!message) return null;

  try {
    const data = JSON.parse(message);
    if (
      typeof data === "object" &&
      data !== null &&
      typeof (data as { key?: unknown }).key === "string"
    ) {
      return data as Envelope;
    }
  } catch {
    return null;
  }

  return null;
};

export default function socket<
  ReadEnvelopes extends Envelopes,
  WriteEnvelopes extends Envelopes,
>({ on, onOpen, onClose }: SocketParams<ReadEnvelopes, WriteEnvelopes>) {
  return {
    open: (ws: ElysiaWS<{ user: User }>) => {
      const socket = wrapServerSocket<WriteEnvelopes>(ws);

      if (onOpen) {
        void onOpen(socket);
      }
    },
    message: async (
      ws: ElysiaWS<{ user: User }>,
      payload: string | ArrayBuffer | ArrayBufferView,
    ) => {
      const raw = await decodePayload(payload);
      const envelope = parseEnvelope(raw);
      if (!envelope) return;

      const handler = on[envelope.key as keyof ReadEnvelopes];
      if (!handler) return;

      await handler({
        payload: envelope.payload as ReadEnvelopes[keyof ReadEnvelopes],
        userId: ws.data.user.id,
      });
    },
    close: (ws: ElysiaWS, code: number, reason?: string) => {
      if (!onClose) return;
      const socket = wrapServerSocket<WriteEnvelopes>(ws);
      void onClose(socket, code, reason);
    },
  };
}

export type ClientSocketConfig<
  ReadEnvelopes extends Envelopes,
  WriteEnvelopes extends Envelopes,
> = Omit<SocketParams<ReadEnvelopes, WriteEnvelopes>, "on"> & {
  onError?: (event: Event) => void;
  on: {
    [K in keyof ReadEnvelopes]: (
      payload: ReadEnvelopes[K],
    ) => void | Promise<void>;
  };
};

export type BrowserSocket<WriteEnvelopes extends Envelopes> =
  LocalSocket<WriteEnvelopes> & {
    socket: WebSocket;
    close: (code?: number, reason?: string) => void;
    dispose: () => void;
  };

export function createBrowserSocket<
  ReadEnvelopes extends Envelopes,
  WriteEnvelopes extends Envelopes,
>(
  socket: WebSocket,
  config: ClientSocketConfig<ReadEnvelopes, WriteEnvelopes>,
): BrowserSocket<WriteEnvelopes> {
  const local: LocalSocket<WriteEnvelopes> = {
    send: (key, payload) => {
      socket.send(
        JSON.stringify({
          key,
          payload,
        }),
      );
    },
  };

  const handleOpen = () => {
    if (config.onOpen) {
      void config.onOpen(local);
    }
  };

  const handleMessage = async (event: MessageEvent) => {
    const raw = await decodePayload(event.data as RawPayload);
    const envelope = parseEnvelope(raw);
    if (!envelope) return;

    const handler = config.on[envelope.key as keyof ReadEnvelopes];
    if (!handler) return;

    await handler(envelope.payload as ReadEnvelopes[keyof ReadEnvelopes]);
  };

  const handleClose = (event: CloseEvent) => {
    if (config.onClose) {
      void config.onClose(local, event.code, event.reason || undefined);
    }
  };

  const handleError = (event: Event) => {
    config.onError?.(event);
  };

  socket.addEventListener("open", handleOpen);
  socket.addEventListener("message", handleMessage);
  socket.addEventListener("close", handleClose);
  socket.addEventListener("error", handleError);

  return {
    ...local,
    socket,
    close: (code, reason) => socket.close(code, reason),
    dispose: () => {
      socket.removeEventListener("open", handleOpen);
      socket.removeEventListener("message", handleMessage);
      socket.removeEventListener("close", handleClose);
      socket.removeEventListener("error", handleError);
    },
  };
}
