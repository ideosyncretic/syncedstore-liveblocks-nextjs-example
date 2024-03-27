"use client";

import * as Y from "yjs";
import { useSyncedStore } from "@syncedstore/react";
import { faker } from "@faker-js/faker";
import { RoomProvider, useRoom } from "./liveblocks.config";
import LiveblocksProvider from "@liveblocks/yjs";
import { getYjsDoc, syncedStore } from "@syncedstore/core";
import { useEffect, useState } from "react";

import "./page.module.css";

const yDoc = new Y.Doc();
const store = syncedStore<{
  arrayOfObjects: Array<{
    id: string;
    content: string;
  }>;
  map: {
    nestedArrayOfStrings?: Array<string>;
    nestedArrayOfObjects?: Array<{
      id: string;
      content: string;
    }>;
    nestedMapOfObjects?: {
      [key: string]: {
        content: string;
      };
    };
  };
}>(
  {
    arrayOfObjects: [],
    map: {},
  },
  yDoc
);

function Demo() {
  const room = useRoom();
  const [doc, setDoc] = useState<Y.Doc>();
  const [provider, setProvider] = useState<unknown>();

  useEffect(() => {
    const yDoc = getYjsDoc(store);
    const yProvider = new LiveblocksProvider(room, yDoc);

    setDoc(yDoc);
    setProvider(yProvider);

    return () => {
      yDoc?.destroy();
      yProvider?.destroy();
    };
  }, [room]);

  const state = useSyncedStore(store);

  if (!doc || !provider) {
    return null;
  }

  // Initialize nested properties
  if (!state.map.nestedArrayOfStrings) {
    state.map.nestedArrayOfStrings = [];
  }
  if (!state.map.nestedArrayOfObjects) {
    state.map.nestedArrayOfObjects = [];
  }
  if (!state.map.nestedMapOfObjects) {
    state.map.nestedMapOfObjects = {};
  }

  return (
    <div className="Demo">
      <h3>
        stringified JSON <code>state</code> from SyncedStore:
      </h3>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <h4>
        When nested store values change, SyncedStore and Y.Doc update correctly
        (see console logs), but React does not re-render.
      </h4>

      <div>
        Top-level updates always trigger React re-render:
        <button
          onClick={() => {
            state.arrayOfObjects.push({
              id: `${faker.string.uuid()}`,
              content: `${faker.word.words()}`,
            });
            console.log(JSON.stringify(state, null, 2));
          }}
        >
          Add to arrayOfObjects
        </button>
      </div>
      <div>
        Nested updates fail to trigger React re-render:
        <button
          onClick={() => {
            state.map.nestedArrayOfStrings?.push(`${faker.word.words()}`);
            console.log(JSON.stringify(state, null, 2));
          }}
        >
          Add to nestedArrayOfStrings
        </button>
        <button
          onClick={() => {
            state.map.nestedArrayOfObjects?.push({
              id: `${faker.string.uuid()}`,
              content: `${faker.word.words()}`,
            });
            console.log(JSON.stringify(state, null, 2));
          }}
        >
          Add to nestedArrayOfObjects
        </button>
        <button
          onClick={() => {
            const id = `${faker.string.uuid()}`;
            const content = `${faker.word.words()}`;
            if (state.map.nestedMapOfObjects !== undefined) {
              state.map.nestedMapOfObjects[id] = {
                content,
              };
            }
            console.log(JSON.stringify(state, null, 2));
          }}
        >
          Add to nestedMapOfObjects
        </button>
      </div>
      <div>
        <button
          onClick={() => {
            // Top level arrays are read-only, cannot be reassigned
            state.arrayOfObjects.splice(0, state.arrayOfObjects.length);
            state.map.nestedArrayOfStrings?.splice(
              0,
              state.map.nestedArrayOfStrings.length
            );
            state.map.nestedArrayOfObjects?.splice(
              0,
              state.map.nestedArrayOfObjects.length
            );
            state.map.nestedMapOfObjects = {};
            console.log(JSON.stringify(state, null, 2));
          }}
        >
          Clear data
        </button>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <RoomProvider
      id="syncedstore-liveblocks-nextjs-example"
      initialPresence={{}}
    >
      <Demo />
    </RoomProvider>
  );
}
