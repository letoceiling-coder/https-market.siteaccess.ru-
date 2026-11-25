import {
  Baby,
  Bike,
  Briefcase,
  Building2,
  Car,
  Gift,
  HardHat,
  HeartHandshake,
  LayoutGrid,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Store,
  Wrench,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  Baby,
  Bike,
  Briefcase,
  Building2,
  Car,
  Gift,
  HardHat,
  HeartHandshake,
  LayoutGrid,
  PawPrint,
  Shirt,
  Smartphone,
  Sofa,
  Sparkles,
  Store,
  Wrench,
};

export function TaxonIcon({ name, className = "size-5" }: { name: string; className?: string }) {
  const Icon = icons[name] ?? LayoutGrid;
  return <Icon className={className} aria-hidden="true" />;
}
