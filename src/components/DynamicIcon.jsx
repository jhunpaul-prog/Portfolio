import {
  Code2,
  Database,
  Cpu,
  Layers,
  Smartphone,
  Globe,
  Server,
  Terminal,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const iconMap = {
  Code2,
  Database,
  Cpu,
  Layers,
  Smartphone,
  Globe,
  Server,
  Terminal,
  ShieldCheck,
  Sparkles,
};

export default function DynamicIcon({ icon, className = "w-5 h-5" }) {
  if (!icon) return <Code2 className={`text-brand ${className}`} />;

  // If it's a selected preset Lucide icon name
  const IconComponent = iconMap[icon];
  if (IconComponent) {
    return <IconComponent className={`text-brand ${className}`} />;
  }

  // If it's an uploaded Custom SVG/PNG (Base64 or Image URL)
  // Uses CSS mask-image so it automatically tints to your exact brand color
  if (
    typeof icon === "string" &&
    (icon.startsWith("data:image") ||
      icon.startsWith("http") ||
      icon.startsWith("/"))
  ) {
    return (
      <span
        className={`inline-block bg-brand flex-shrink-0 ${className}`}
        style={{
          maskImage: `url("${icon}")`,
          WebkitMaskImage: `url("${icon}")`,
          maskSize: "contain",
          WebkitMaskSize: "contain",
          maskRepeat: "no-repeat",
          WebkitMaskRepeat: "no-repeat",
          maskPosition: "center",
          WebkitMaskPosition: "center",
        }}
      />
    );
  }

  return <Code2 className={`text-brand ${className}`} />;
}
