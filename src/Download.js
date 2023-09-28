import { useState } from "react";
import { Plugins } from "@capacitor/core";

const { CapacitorHttp } = Plugins;

const dummy_url_here =
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

const Download = () => {
  const [downloadingStart, setDownloadingStart] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [start, setStart] = useState(0);

  const splitIntoChunks = async (url, chunkSize) => {
    try {
      const response = await CapacitorHttp.request({
        url,
        methods: "HEAD",
      });

      if (response.status !== 200) {
        throw new Error("Network response was not ok");
      }
      const fileSize = parseInt(response.headers["content-length"]);

      const totalChunks = Math.ceil(fileSize / chunkSize);
      const chunkPromises = [];

      for (let i = 0; i < totalChunks; i++) {
        const startByte = i * chunkSize;
        const endByte = Math.min((i + 1) * chunkSize, fileSize);
        const chunkFilePath = `chunk_${i}.mp4`; // Unique file name for each chunk
        const chunkResponse = await CapacitorHttp.get({
          url,
          filePath: chunkFilePath,
          headers: {
            Range: `bytes=${startByte}-${endByte - 1}`,
          },
        });
        console.log("__chunkResponse", chunkResponse);
        setStart(i + 1);
        if (chunkResponse.status !== 206) {
          throw new Error(`Error downloading chunk ${i}`);
        }

        chunkPromises.push(chunkFilePath);
      }

      return chunkPromises;
    } catch (error) {
      console.error("Error splitting file into chunks:", error);
      throw error;
    }
  };

  const mergeChunks = async (chunks, fileName) => {
    try {
      const blobParts = [];
      console.log("__chunks", chunks);
      for (const chunkFilePath of chunks) {
        const response = await fetch(chunkFilePath);

        console.log("__response", response);
        if (!response.ok) {
          throw new Error(`Error fetching chunk ${chunkFilePath}`);
        }

        const chunkArrayBuffer = await response.arrayBuffer();
        // Create a blob with the 'video/mp4' content type
        const contentType = "video/mp4";
        const chunkBlob = new Blob([chunkArrayBuffer], { type: contentType });

        console.log("__chunkBlob", chunkBlob);
        blobParts.push(chunkBlob);
        // const chunkBlob = await response.blob();
        // blobParts.push(chunkBlob);

        // Optionally, you can delete the local chunk file on the web if needed
        // Note: Deleting local files on the web is not a standard capability
        // and would require custom logic specific to your web application's setup.
      }
      console.log("__blobParts", blobParts);
      const blob = new Blob(blobParts, { type: "video/mp4" });
      console.log("__lbob", blob);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);

      setDownloaded(true);
      setDownloadingStart(false);
    } catch (error) {
      console.error("Error merging chunks and downloading file:", error);
    }
  };

  const downloadFile = async () => {
    setDownloadingStart(true);
    try {
      const chunkSize = 1024 * 1024 * 50; // 1MB (adjust as needed)
      const url = dummy_url_here; // Replace with the actual file URL
      const chunks = await splitIntoChunks(url, chunkSize);
      mergeChunks(chunks, "downloaded_file.mp4"); // Replace with the desired filename
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  };

  return (
    <div>
      {downloadingStart && <p>Downloading in Progress... ({start}/4)</p>}
      <button onClick={downloadFile}>Download File</button>
      {downloaded && <p>File downloaded successfully!</p>}
    </div>
  );
};

export default Download;
