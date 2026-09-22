"use client";
import { useEffect, useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "./ui/button";
import { fileDecision } from "@/lib/trust";
import { videoFileIssue } from "@/lib/sport-profile";

type Attachment = { url: string; name: string; video: boolean };

export function usePostAttachment() {
  const [media, setMedia] = useState<Attachment | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const owned = useRef("");
  const generation = useRef(0);
  useEffect(
    () => () => {
      generation.current++;
      if (owned.current) URL.revokeObjectURL(owned.current);
    },
    [],
  );
  function clear(committed = false) {
    generation.current++;
    if (owned.current && !committed) URL.revokeObjectURL(owned.current);
    owned.current = ""; // Committed URLs are owned by DemoProvider.
    setMedia(null);
    setBusy(false);
    setError("");
  }
  async function choose(file?: File) {
    if (!file) return;
    clear();
    const token = generation.current;
    const video = file.type.startsWith("video/");
    const issue = video
      ? videoFileIssue(file)
      : fileDecision(file.name, file.type, file.size, "Photo");
    if (issue) {
      setError(issue);
      return;
    }
    const url = URL.createObjectURL(file);
    owned.current = url;
    setBusy(true);
    const valid = await new Promise<boolean>((resolve) => {
      const element = video ? document.createElement("video") : new Image();
      const timeout = setTimeout(() => finish(false), 10000);
      function finish(ok: boolean) {
        clearTimeout(timeout);
        element.onerror = null;
        if (element instanceof HTMLVideoElement) {
          element.onloadeddata = null;
          element.removeAttribute("src");
          element.load();
        } else {
          element.onload = null;
          element.removeAttribute("src");
        }
        resolve(ok);
      }
      element.onerror = () => finish(false);
      if (element instanceof HTMLVideoElement) {
        element.preload = "auto";
        element.onloadeddata = () =>
          finish(
            Number.isFinite(element.duration) && element.duration > 0 && element.videoWidth > 0,
          );
      } else element.onload = () => finish(element.naturalWidth > 0 && element.naturalHeight > 0);
      element.src = url;
    });
    if (token !== generation.current) {
      URL.revokeObjectURL(url);
      return;
    }
    setBusy(false);
    if (!valid) {
      URL.revokeObjectURL(url);
      owned.current = "";
      setError("Fichier illisible. Choisissez une autre image ou vidéo.");
      return;
    }
    setMedia({ url, name: file.name, video });
  }
  return { media, busy, error, choose, clear };
}

export function PostAttachment({
  attachment,
}: {
  attachment: ReturnType<typeof usePostAttachment>;
}) {
  const input = useRef<HTMLInputElement>(null);
  const { media, busy, error, choose, clear } = attachment;
  return (
    <div className="post-attachment">
      <p>Photo ou vidéo (facultatif)</p>
      <input
        ref={input}
        hidden
        type="file"
        aria-label="Importer une photo ou une vidéo"
        accept="image/jpeg,image/png,image/webp,video/mp4,video/webm"
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          void choose(file);
        }}
      />
      <Button
        type="button"
        variant="outline"
        className="post-upload-button"
        onClick={() => input.current?.click()}
      >
        <Upload size={18} />
        {media ? "Remplacer le média" : "Importer une photo ou une vidéo"}
      </Button>
      <p className="field-hint">
        JPG, PNG ou WebP : 10 Mo maximum. MP4 ou WebM : 50 Mo maximum. Aperçu local uniquement, sans
        envoi vers un serveur.
      </p>
      {busy && <p role="status">Vérification du fichier…</p>}
      {error && (
        <>
          <p role="alert" className="field-error">
            {error}
          </p>
          <Button type="button" variant="ghost" onClick={() => clear()}>
            Continuer sans média
          </Button>
        </>
      )}
      {media && (
        <div className="post-attachment-preview">
          {media.video ? (
            <video controls playsInline src={media.url} aria-label="Aperçu de la vidéo à publier" />
          ) : (
            <img src={media.url} alt="Aperçu de la photo à publier" />
          )}
          <p>{media.name}</p>
          <Button type="button" variant="ghost" onClick={() => clear()}>
            Retirer le média
          </Button>
        </div>
      )}
    </div>
  );
}
