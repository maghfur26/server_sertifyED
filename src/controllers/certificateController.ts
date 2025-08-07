import { Request, Response } from "express";
import fs from "fs";
import { QRCode } from "qrcode";
import { getFsHelia } from "../config/helia.config";
import { issueCertificate, verifyCertificate } from "../services/blockchainService";

export async function uploadCertificate(req: Request, res: Response): Promise<void> {
    try {
        
    } catch (error) {
        
    }
}