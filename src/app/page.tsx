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
  arrayOfStrings: Array<string>;
  arrayOfObjects: Array<{
    id: string;
    label: string;
  }>;
  topLevelObject: {
    nestedArrayOfObjects?: Array<{
      id: string;
      label: string;
    }>;
  };
}>(
  {
    arrayOfStrings: [],
    arrayOfObjects: [],
    topLevelObject: {},
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

  return (
    <div className="Demo">
      <h1>
        Liveblocks shows objects in arrays as `[object Object]` when Yjs and
        SyncedStore are correct.
      </h1>
      {/* <h1>
        When updating contents of a nested array of objects (in top-level Y.Map)
        SyncedStore updates store/Y.Doc correctly, but does not trigger React to
        re-render
      </h1> */}
      <h3>Stringified JSON from SyncedStore (synced to Liveblocks room):</h3>
      <pre>{JSON.stringify(state, null, 2)}</pre>
      <div>
        {/* <button onClick={() => console.log(getYjsDoc(store)?.toJSON())}>
          Console log Yjs doc as JSON
        </button>
        <button
          onClick={() => {
            state.arrayOfStrings.push(`${faker.word.words()}`);
          }}
        >
          Add string to top level array
        </button> */}
        <button
          onClick={() => {
            state.arrayOfObjects.push({
              id: `${faker.string.uuid()}`,
              label: `${faker.word.words()}`,
            });
          }}
        >
          Add object to top level array
        </button>
        <button
          onClick={() => {
            if (!state.topLevelObject.nestedArrayOfObjects) {
              state.topLevelObject.nestedArrayOfObjects = [];
            }
            state.topLevelObject.nestedArrayOfObjects?.push({
              id: `${faker.string.uuid()}`,
              label: `${faker.word.words()}`,
            });
          }}
        >
          Add object to nested array
        </button>
        <button
          onClick={() => {
            // Top level arrays are read-only, cannot be reassigned
            state.arrayOfStrings.splice(0, state.arrayOfStrings.length);
            state.arrayOfObjects.splice(0, state.arrayOfObjects.length);
            state.topLevelObject.nestedArrayOfObjects?.splice(
              0,
              state.topLevelObject.nestedArrayOfObjects.length
            );
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
    <RoomProvider id="codesandbox-liveblocks" initialPresence={{}}>
      <Demo />
    </RoomProvider>
  );
}
