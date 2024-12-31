import fs from "fs-extra";
import path from "path";

export const handleFileChunks = {
  async saveChunk(chunk, fileName, chunkNumber) {
    const chunkDir = path.join(process.cwd(), "uploads/chunks");
    await fs.ensureDir(chunkDir);

    const chunkPath = path.join(chunkDir, `${fileName}.part_${chunkNumber}`);
    await fs.writeFile(chunkPath, chunk);
    return chunkPath;
  },

  async mergeChunks(fileName, totalChunks) {
    const chunkDir = path.join(process.cwd(), "uploads/chunks");
    const finalDir = path.join(process.cwd(), "uploads/userguides");
    await fs.ensureDir(finalDir);

    const writeStream = fs.createWriteStream(path.join(finalDir, fileName));

    for (let i = 0; i < totalChunks; i++) {
      const chunkPath = path.join(chunkDir, `${fileName}.part_${i}`);
      const chunkBuffer = await fs.readFile(chunkPath);
      writeStream.write(chunkBuffer);
      await fs.remove(chunkPath);
    }

    return new Promise((resolve, reject) => {
      writeStream.on("finish", () => resolve(fileName));
      writeStream.on("error", reject);
      writeStream.end();
    });
  },
};
