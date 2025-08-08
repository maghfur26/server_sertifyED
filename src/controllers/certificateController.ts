import { Request, Response } from "express";
import fs from "fs/promises"; // Gunakan versi promise untuk async/await
import { getOnChainVerificationData, getTokenIdsByOwner, issueCertificateOnChain } from "../services/blockchainService";
import { FileModel } from "../models/File";
import CertificateModel from "../models/Certificate";
import { createDataHash } from "../utils/hash";

export async function uploadCertificate(req: Request, res: Response): Promise<void> {
  const { studentName, courseTitle, issuerName, recipientWallet, certificateDescription, grade } = req.body;
  const file = req.file;

  if (!file) {
    res.status(400).json({ message: "No file uploaded" });
    return;
  }
  if (!studentName || !courseTitle || !issuerName || !recipientWallet) {
    // Jika ada field yang kurang, hapus file yang sudah terlanjur di-upload
    await fs.unlink(file.path);
    res.status(400).json({ message: "Missing required fields" });
    return;
  }

  // Simpan metadata file terlebih dahulu
  const uploadedFile = await FileModel.create({
    filename: file.filename,
    path: file.path, // Simpan path lengkap untuk kemudahan penghapusan
    mimetype: file.mimetype,
    size: file.size,
  });

  try {
    // LANGKAH 1: Siapkan data lengkap untuk di-hash dan disimpan
    const certificateFullData = {
      studentName,
      courseTitle,
      issueDate: new Date().toISOString(),
      issuerName,
      recipientWallet,
      certificateDescription: certificateDescription || null,
      grade: grade || null,
      // URL ini bisa digunakan oleh frontend untuk menampilkan gambar
      visualAssetUrl: `/uploads/${file.filename}`,
    };

    // LANGKAH 2: Buat "Sidik Jari Digital" (dataHash)
    const dataHash = createDataHash(certificateFullData);
    console.log(`Data Hash Dibuat: ${dataHash}`);

    // LANGKAH 3: Terbitkan di Blockchain
    console.log(`Menerbitkan ke blockchain untuk wallet: ${recipientWallet}`);
    const { tokenId, transactionHash } = await issueCertificateOnChain(recipientWallet, dataHash);
    console.log(`Berhasil di-mint! Token ID: ${tokenId}, Tx Hash: ${transactionHash}`);

    // LANGKAH 4: Simpan bukti lengkap ke CertificateModel
    await CertificateModel.create({
      ...certificateFullData,
      tokenId,
      transactionHash,
      dataHash,
      fileId: uploadedFile.id, // Tautkan dengan file yang di-upload
    });

    // LANGKAH 5: Kirim respons sukses
    res.status(201).json({
      message: "Sertifikat berhasil diterbitkan on-chain dan off-chain.",
      tokenId,
      transactionHash,
    });
  } catch (error) {
    console.error("Error saat proses penerbitan sertifikat:", error);

    // Jika terjadi error, lakukan rollback: hapus file fisik dan record dari database
    // untuk menjaga konsistensi data.
    try {
      await fs.unlink(file.path);
      await FileModel.deleteOne({ _id: uploadedFile.id });
      console.log(`Rollback berhasil: file ${file.filename} dan record DB telah dihapus.`);
    } catch (cleanupError) {
      console.error("Error saat melakukan cleanup (rollback):", cleanupError);
    }

    res.status(500).json({
      message: "Gagal menerbitkan sertifikat.",
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function getVerificationDataById(req: Request, res: Response): Promise<void> {
  const { tokenId } = req.params;

  try {
    const certificate = await CertificateModel.findOne({ tokenId });
    console.log("\n1. Mengambil data sertifikat...");
    console.log(`Mengambil data sertifikat dengan Token ID: ${tokenId}`);
    console.log(`   -> Sertifikat: ${certificate}`);

    if (!certificate || !certificate.tokenId) {
      res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      return;
    }

    const { dataHash, ownerWallet } = await getOnChainVerificationData(certificate.tokenId);
    if (dataHash === certificate.dataHash && ownerWallet === certificate.recipientWallet) {
      const data = {
        transactionHash: certificate.transactionHash,
        dataHash: certificate.dataHash,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        issueDate: certificate.issueDate,
        issuerName: certificate.issuerName,
        recipientWallet: certificate.recipientWallet,
        certificateDescription: certificate.certificateDescription,
        grade: certificate.grade,
        tokenId: certificate.tokenId,
        organization: certificate.organization,
        file: certificate.file,
      };

      res.status(200).json({ message: "Sertifikat ditemukan dalam blockchain", data });
    } else {
      res.status(400).json({ message: "Data tidak cocok dengan yang ada di blockchain" });
    }
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
}

export async function getCertificateByOwner(req: Request, res: Response): Promise<void> {
  const { walletAddress } = req.body;

  try {
    const certificate = await CertificateModel.findOne({ recipientWallet: walletAddress });

    if (!certificate) {
      res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      return;
    }

    const datas: bigint[] = await getTokenIdsByOwner(walletAddress);

    if (!datas) {
      res.status(404).json({ message: "Sertifikat tidak ditemukan" });
      return;
    }
    const tokenIds = datas.map((tokenId) => Number(tokenId));

    const offChainCertificates: any[] = [];
    for (const tokenId of tokenIds) {
      const offChainCertificate = await CertificateModel.findOne({ tokenId });
      if (offChainCertificate) {
        offChainCertificates.push(offChainCertificate);
      }
    }

    res.status(200).json({ message: "Sertifikat ditemukan dalam blockchain", offChainCertificates });
  } catch (error) {
    res.status(500).json({ message: "Terjadi kesalahan", error });
  }
}
