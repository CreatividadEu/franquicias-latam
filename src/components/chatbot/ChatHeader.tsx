import Image from "next/image";
import { cn } from "@/lib/utils";

interface ChatHeaderProps {
  compact?: boolean;
  className?: string;
}

export function ChatHeader({ compact = false, className }: ChatHeaderProps) {
  if (compact) {
    return (
      <div
        className={cn(
          "h-14 sm:h-16 px-4 sm:px-6 flex items-center gap-3 bg-white",
          className
        )}
      >
        <Image
          src="/logo_latam/franquicias_latam_logo.png"
          alt="Franquicias LATAM"
          width={240}
          height={60}
          className="h-8 sm:h-9 w-auto"
          priority
        />
        <span className="text-sm sm:text-base font-semibold text-neutral-800 truncate">
          Franquicias LATAM
        </span>
      </div>
    );
  }

  return (
    <div className={cn("px-6 pt-8 pb-6 text-center bg-white", className)}>
      {/* Logo */}
      <div className="flex justify-center mb-4">
        <Image
          src="/logo_latam/franquicias_latam_logo.png"
          alt="Franquicias LATAM"
          width={720}
          height={180}
          className="h-32 w-auto"
          priority
        />
      </div>

      {/* Title */}
      <h1 className="text-2xl sm:text-3xl font-bold leading-tight">
        <span className="text-neutral-900">Hola, Bienvenido a </span>
        <span className="text-neutral-500">Franquicias LATAM</span>
      </h1>
    </div>
  );
}
