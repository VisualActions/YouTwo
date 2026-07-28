import UploadForm from "./UploadForm";

export default function UploadPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">Upload video</h1>
      <p className="mt-1 text-sm text-yt-sub">
        Your video is transcoded to HLS after upload and goes live when processing
        finishes.
      </p>
      <UploadForm />
    </div>
  );
}
