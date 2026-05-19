import { CheckCircle2, Download, Play, Upload } from "lucide-react";

const swatches = ["#f5d7a1", "#ea9d59", "#bc6142", "#6f3f2d", "#fef7e6", "#1f2933", "#f4f0dc", "#7fb685"];

function PixelPreview({ label, offset }: { label: string; offset: number }) {
  return (
    <div className="frame-tile" aria-label={`${label} UI mock frame`}>
      <div className="pixel-canvas">
        {Array.from({ length: 64 }, (_, index) => (
          <span
            key={index}
            style={{
              backgroundColor: swatches[(index + offset + Math.floor(index / 8)) % swatches.length]
            }}
          />
        ))}
      </div>
      <span className="frame-label">{label}</span>
    </div>
  );
}

export default function Home() {
  return (
    <main className="page">
      <h1 className="title">Pet Generate</h1>
      <p className="subtitle">Upload an image to generate a pixel sprite set.</p>

      <section aria-label="Generation options">
        <div className="field-row">
          <span className="label">Mood</span>
          <div className="segmented">
            <button type="button" className="pill" data-active="true">
              cheerful
            </button>
            <button type="button" className="pill">
              sleepy
            </button>
            <button type="button" className="pill">
              playful
            </button>
          </div>
        </div>

        <div className="field-row">
          <span className="label">Frames</span>
          <div className="frame-toggle">
            <span>4</span>
            <button type="button" className="switch" data-frames="4" aria-label="Toggle frame count" />
            <span>8</span>
          </div>
        </div>
      </section>

      <label className="dropzone">
        <input type="file" accept="image/png,image/jpeg,image/webp,image/gif" disabled />
        <span className="dropzone-stack">
          <Upload size={24} aria-hidden="true" />
          <span>Drop an image or click to select</span>
        </span>
      </label>

      <p className="status">UI mock only. Upload, generation, export, validation, and persistence are not implemented.</p>

      <div className="section-head">
        <h2 className="section-title">Sprite grid</h2>
      </div>

      <section className="sprite-grid" aria-label="Generated sprite frames mock">
        <PixelPreview label="idle" offset={0} />
        <PixelPreview label="blink" offset={2} />
        <PixelPreview label="hop" offset={4} />
        <PixelPreview label="tail" offset={6} />
      </section>

      <div className="section-head">
        <h2 className="section-title">Animation</h2>
      </div>

      <section className="animation-wrap" aria-label="Animation preview mock">
        <PixelPreview label="preview" offset={1} />
        <button type="button" className="icon-button">
          <Play size={14} aria-hidden="true" />
          Play
        </button>
      </section>

      <div className="downloads">
        <button type="button" className="download-button primary">
          <Download size={14} aria-hidden="true" />
          Sprite PNG
        </button>
        <button type="button" className="download-button">
          <Download size={14} aria-hidden="true" />
          Manifest
        </button>
      </div>

      <div className="toast" role="status">
        <CheckCircle2 size={18} aria-hidden="true" />
        Target UI state for harness implementation.
      </div>
    </main>
  );
}
