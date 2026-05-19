"use client";

import { CheckCircle2, Download, Play, RefreshCcw, Square, Upload } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FrameCount, GenerationResult, Mood, PixelFrame, UploadResult } from "@/lib/pet-contract";
import { moods } from "@/lib/pet-contract";

type Stage = "idle" | "uploading" | "generating" | "ready" | "error";

function PixelCanvas({ frame }: { frame: PixelFrame }) {
  return (
    <div className="pixel-canvas" aria-label={`${frame.label} pixel frame`}>
      {frame.cells.map((cell, index) => (
        <span key={`${frame.id}-${index}`} style={{ background: frame.palette[cell] }} />
      ))}
    </div>
  );
}

async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? "Request failed.");
  }

  return payload as T;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export default function Home() {
  const [mood, setMood] = useState<Mood>("cheerful");
  const [frameCount, setFrameCount] = useState<FrameCount>(4);
  const [upload, setUpload] = useState<UploadResult | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [stage, setStage] = useState<Stage>("idle");
  const [message, setMessage] = useState("Drop an image to begin.");
  const [dragging, setDragging] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [activeFrame, setActiveFrame] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const animationFrame = useMemo(() => {
    if (!result?.frames.length) {
      return null;
    }
    return result.frames[activeFrame % result.frames.length];
  }, [activeFrame, result]);

  useEffect(() => {
    if (!playing || !result?.frames.length) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveFrame((frame) => (frame + 1) % result.frames.length);
    }, 420);

    return () => window.clearInterval(interval);
  }, [playing, result]);

  const reset = useCallback(() => {
    setUpload(null);
    setResult(null);
    setStage("idle");
    setMessage("Drop an image to begin.");
    setPlaying(false);
    setActiveFrame(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, []);

  const generate = useCallback(
    async (file: File) => {
      setStage("uploading");
      setMessage("Validating image...");
      setResult(null);
      setPlaying(false);
      setActiveFrame(0);

      try {
        const formData = new FormData();
        formData.set("image", file);

        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: formData
        });
        const uploadPayload = await uploadResponse.json();

        if (!uploadResponse.ok) {
          throw new Error(uploadPayload.error ?? "Upload failed.");
        }

        setUpload(uploadPayload.upload);
        setStage("generating");
        setMessage("Generating sprite frames...");

        const generationPayload = await postJson<{ result: GenerationResult }>("/api/generate", {
          upload: uploadPayload.upload,
          mood,
          frameCount
        });

        setResult(generationPayload.result);
        setStage("ready");
        setMessage("Sprite set ready.");
        setPlaying(true);
      } catch (error) {
        setStage("error");
        setMessage(error instanceof Error ? error.message : "Generation failed.");
      }
    },
    [frameCount, mood]
  );

  const handleFiles = useCallback(
    (files: FileList | null) => {
      const file = files?.item(0);
      if (file) {
        void generate(file);
      }
    },
    [generate]
  );

  const exportSpriteSheet = useCallback(async () => {
    if (!result) {
      return;
    }

    const response = await fetch("/api/export/sprite-sheet", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ result })
    });

    if (!response.ok) {
      setStage("error");
      setMessage("Sprite sheet export failed.");
      return;
    }

    downloadBlob(await response.blob(), "sprite-sheet.png");
  }, [result]);

  const exportManifest = useCallback(async () => {
    if (!result) {
      return;
    }

    const payload = await postJson<Record<string, unknown>>("/api/export/manifest", { result });
    downloadBlob(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }), "manifest.json");
  }, [result]);

  return (
    <main className="page">
      <h1 className="title">Pet Generate</h1>
      <p className="subtitle">Upload an image to generate a pixel sprite set.</p>

      <section aria-label="Generation options">
        <div className="field-row">
          <span className="label">Mood</span>
          <div className="segmented">
            {moods.map((item) => (
              <button key={item} type="button" className="pill" data-active={mood === item} onClick={() => setMood(item)}>
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="field-row">
          <span className="label">Frames</span>
          <div className="frame-toggle">
            <span>4</span>
            <button
              type="button"
              className="switch"
              data-frames={frameCount}
              aria-label="Toggle frame count"
              onClick={() => setFrameCount((current) => (current === 4 ? 8 : 4))}
            />
            <span>8</span>
          </div>
        </div>
      </section>

      {!result ? (
        <label
          className="dropzone"
          data-dragging={dragging}
          onDragOver={(event) => {
            event.preventDefault();
            setDragging(true);
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragging(false);
            handleFiles(event.dataTransfer.files);
          }}
        >
          <input ref={inputRef} type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => handleFiles(event.target.files)} />
          <span className="dropzone-stack">
            <Upload size={24} aria-hidden="true" />
            <span>{upload ? upload.name : "Drop an image or click to select"}</span>
          </span>
        </label>
      ) : null}

      <p className={stage === "error" ? "status error" : "status"}>{message}</p>

      {result ? (
        <>
          <div className="section-head">
            <h2 className="section-title">Sprite grid</h2>
            <button type="button" className="icon-button" onClick={reset}>
              <RefreshCcw size={14} aria-hidden="true" />
              Reset
            </button>
          </div>

          <section className="sprite-grid" aria-label="Generated sprite frames">
            {result.frames.map((frame) => (
              <div className="frame-tile" key={frame.id}>
                <PixelCanvas frame={frame} />
                <span className="frame-label">{frame.mood}</span>
              </div>
            ))}
          </section>

          <div className="section-head">
            <h2 className="section-title">Animation</h2>
          </div>

          <section className="animation-wrap" aria-label="Animation preview">
            <div className="animation-stage">{animationFrame ? <PixelCanvas frame={animationFrame} /> : null}</div>
            <button type="button" className="icon-button" onClick={() => setPlaying((current) => !current)}>
              {playing ? <Square size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              {playing ? "Stop" : "Play"}
            </button>
          </section>

          <div className="downloads">
            <button type="button" className="download-button primary" onClick={exportSpriteSheet}>
              <Download size={14} aria-hidden="true" />
              sprite-sheet.png
            </button>
            <button type="button" className="download-button" onClick={exportManifest}>
              <Download size={14} aria-hidden="true" />
              manifest.json
            </button>
          </div>

          <button type="button" className="icon-button" onClick={reset}>
            Reset
          </button>

          <div className="toast" role="status">
            <CheckCircle2 size={18} aria-hidden="true" />
            Sprite set ready
          </div>
        </>
      ) : null}
    </main>
  );
}
