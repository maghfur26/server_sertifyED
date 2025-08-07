import { createHelia, Helia } from "helia";
import { unixfs, UnixFS } from "@helia/unixfs";

let helia: Helia, fsHelia: UnixFS;

async function initializeHelia(): Promise<void> {
  helia = await createHelia();
  fsHelia = unixfs(helia);
  console.log("Helia initialized, Peer ID:", helia.libp2p.peerId.toString());
}

initializeHelia();

export { helia, initializeHelia };
