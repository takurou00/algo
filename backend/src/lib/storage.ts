import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";

const account = process.env.AZURE_STORAGE_ACCOUNT_NAME!;
const accountKey = process.env.AZURE_STORAGE_ACCOUNT_KEY!;
const containerName = process.env.AZURE_STORAGE_CONTAINER_NAME ?? "mediavault";

const credential = new StorageSharedKeyCredential(account, accountKey);
const blobServiceClient = new BlobServiceClient(
  `https://${account}.blob.core.windows.net`,
  credential
);

const containerClient = blobServiceClient.getContainerClient(containerName);

export async function uploadBlob(
  key: string,
  buffer: Buffer,
  contentType: string
): Promise<string> {
  const blockBlobClient = containerClient.getBlockBlobClient(key);
  await blockBlobClient.uploadData(buffer, {
    blobHTTPHeaders: { blobContentType: contentType },
  });
  return blockBlobClient.url;
}

export async function deleteBlob(key: string): Promise<void> {
  const blockBlobClient = containerClient.getBlockBlobClient(key);
  await blockBlobClient.deleteIfExists();
}

export async function getBlobSasUrl(
  key: string,
  expiresInMinutes = 60
): Promise<string> {
  const blockBlobClient = containerClient.getBlockBlobClient(key);
  const expiresOn = new Date();
  expiresOn.setMinutes(expiresOn.getMinutes() + expiresInMinutes);

  const sasUrl = await blockBlobClient.generateSasUrl({
    permissions: { read: true },
    expiresOn,
  });
  return sasUrl;
}
