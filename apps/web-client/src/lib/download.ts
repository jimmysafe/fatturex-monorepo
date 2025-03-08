export async function downloadFileBlob(blob: Blob, fileName: string) {
  try {
    const url = window.URL.createObjectURL(new Blob([blob]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName);
    // Append to html link element page
    document.body.appendChild(link);
    // Start download
    link.click();
    // Clean up and remove the link
    link?.parentNode?.removeChild(link);
  }
  catch (err: any) {
    console.error(err);
  }
}
