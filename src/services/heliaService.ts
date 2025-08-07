import { helia } from "../config/helia.config";
import { unixfs as heliaUnixfs } from "@helia/unixfs";
import { CID } from "multiformats/cid";

class HeliaService {
  static async uploadFile(fileBuffer: Buffer | Uint8Array, filename: string) {
    try {
      if (!helia) {
        throw new Error("Helia is not initialized");
      }
      const unixfs = heliaUnixfs(helia);
      const cid = await unixfs.addFile({ content: fileBuffer, path: filename });

      return {
        hash: cid.toString(),
        size: fileBuffer.length,
        url: "https://ipfs.io/ipfs/" + cid.toString(),
      };
    } catch (error: any) {
      console.log("Helia upload error", error);
      throw new Error(`Helia upload error: ${error.message}`);
    }
  }

  static async getFile(hash: string) {
    try {
      if (!helia) {
        throw new Error("Helia is not initialized");
      }
      const unixfs = heliaUnixfs(helia);
      const cid = CID.parse(hash);
      const file = await unixfs.cat(cid);
      return file;
    } catch (error: any) {
      console.log("Helia get file error", error);
      throw new Error(`Helia get file error: ${error.message}`);
    }
  }

  static async pinFile(hash: string) {
    try {
      if (!hash) {
        throw new Error("No hash provided");
      }
      if (!helia) {
        throw new Error("Helia is not initialized");
      }
      const cid = CID.parse(hash);
      await helia.pins.add(cid);
      return true;
    } catch (error) {
      console.error("Helia pin file error", error);
      return false;
    }
  }
}

export default HeliaService;