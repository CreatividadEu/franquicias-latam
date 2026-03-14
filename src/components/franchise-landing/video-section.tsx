"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import type { VideoData } from "@/lib/franchise-mapper";

function getYouTubeId(url: string): string | null {
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match?.[1] ?? null;
}

export function VideoSection({ data }: { data: VideoData }) {
  const [loaded, setLoaded] = useState(false);
  const videoId = getYouTubeId(data.youtubeUrl);

  if (!videoId) return null;

  const thumbUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;

  return (
    <section className="bg-white py-16 md:py-24" aria-label="Video">
      <div className="mx-auto max-w-6xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="overflow-hidden rounded-2xl"
          style={{
            background: "#ffffff",
            border: "1px solid rgba(0,0,0,0.08)",
            boxShadow: "0 4px 40px rgba(0,0,0,0.10)",
          }}
        >
          <div className="relative aspect-video w-full">
            {!loaded ? (
              <button
                onClick={() => setLoaded(true)}
                className="group absolute inset-0 flex items-center justify-center"
                aria-label="Reproducir video"
              >
                <img
                  src={thumbUrl}
                  alt="Video preview"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div
                  className="absolute inset-0 transition-opacity group-hover:opacity-80"
                  style={{ background: "rgba(0,0,0,0.35)" }}
                />
                <div
                  className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full backdrop-blur-sm transition-all group-hover:scale-110"
                  style={{
                    background: "rgba(255,255,255,0.92)",
                    border: "1px solid rgba(0,0,0,0.08)",
                    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
                  }}
                >
                  <Play className="h-6 w-6 fill-[#2563eb] text-[#2563eb]" />
                </div>
              </button>
            ) : (
              <iframe
                src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                title="Franchise video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
                loading="lazy"
              />
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
