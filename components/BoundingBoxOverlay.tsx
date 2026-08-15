import type { BoundingBox } from "@/domain/types";

export default function BoundingBoxOverlay({ imageUrl, box, label }: { imageUrl: string; box: BoundingBox; label?: string }) {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-asphalt-line">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={imageUrl} alt="Reported road damage" className="block w-full" />
      <div
        className="absolute border-2 border-amber shadow-[0_0_0_2px_rgba(0,0,0,0.4)]"
        style={{
          left: `${box.x * 100}%`,
          top: `${box.y * 100}%`,
          width: `${box.width * 100}%`,
          height: `${box.height * 100}%`,
        }}
      >
        {label && (
          <span className="absolute -top-6 left-0 rounded bg-amber px-1.5 py-0.5 font-mono text-[10px] font-semibold text-asphalt">
            {label}
          </span>
        )}
      </div>
    </div>
  );
}
