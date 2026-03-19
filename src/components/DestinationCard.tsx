"use client";

import Link from "next/link";
import { motion } from "framer-motion";

interface DestinationCardProps {
  name: string;
  country: string;
  iata?: string;
  locationId?: string;
  hotelsCount?: string;
}

export function DestinationCard({
  name,
  country,
  iata,
}: DestinationCardProps) {
  const photoUrl = iata
    ? `https://photo.hotellook.com/static/cities/960x720/${iata}.jpg`
    : null;

  return (
    <Link
      href={`/flights?destination=${iata || ""}&destinationName=${encodeURIComponent(name)}`}
      className="group relative block rounded-xl overflow-hidden h-64 shadow-md hover:shadow-2xl transition-shadow duration-500"
    >
      {photoUrl ? (
        <motion.img
          src={photoUrl}
          alt={name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-primary/40" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent group-hover:from-black/80 transition-colors duration-500" />
      <motion.div
        className="absolute bottom-0 left-0 right-0 p-4"
        whileHover={{ y: -6 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      >
        <h3 className="text-white text-xl font-bold drop-shadow-lg">{name}</h3>
        <p className="text-white/80 text-sm">{country}</p>
      </motion.div>
    </Link>
  );
}
