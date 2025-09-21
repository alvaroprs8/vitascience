"use client";
import Image from "next/image";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface AvatarItem {
  id: number;
  name: string;
  designation: string;
  image: string;
  available?: boolean;
}

interface AvatarGroupProps {
  items: AvatarItem[];
  className?: string;
  maxVisible?: number;
  size?: "sm" | "md" | "lg";
  onItemClick?: (item: AvatarItem) => void;
  selectedId?: number | null;
}

// Individual Avatar Component
const Avatar = ({
  item,
  index,
  totalItems,
  size,
  isHovered,
  onHover,
  onLeave,
  onClick,
  selected,
}: {
  item: AvatarItem;
  index: number;
  totalItems: number;
  size: "sm" | "md" | "lg";
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onClick?: () => void;
  selected?: boolean;
}) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return (
    <div
      className={cn("relative group flex items-center justify-center", !item.available && "opacity-60 cursor-not-allowed")}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={item.available ? onClick : undefined}
      style={{
        marginLeft: index === 0 ? 0 : "-0.5rem",
        zIndex: totalItems - index,
      }}
    >
      <AnimatePresence mode="popLayout">
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
              transition: {
                type: "spring",
                stiffness: 200,
                damping: 20,
              },
            }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="absolute -top-16 whitespace-nowrap flex text-xs flex-col items-center justify-center rounded-xl bg-white z-50 shadow-lg px-4 py-2 border min-w-max"
          >
            <div className="font-bold text-gray-900 relative z-30 text-base text-center">
              {item.name}
            </div>
            <div className="text-gray-600 text-xs text-center">
              {item.designation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        whileHover={{ scale: 1.05, zIndex: 100 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <Image
          height={100}
          width={100}
          src={item.image}
          alt={item.name}
          className={cn(
            "object-cover !rounded-full border-2 border-background transition duration-300",
            sizeClasses[size],
            item.available && "cursor-pointer",
            isHovered && item.available && "ring-2 ring-emerald-400",
            // selected ring handled by parent via selected class if necessary
          )}
        />
      </motion.div>
    </div>
  );
};

const AvatarGroup = ({
  items,
  className,
  maxVisible = 5,
  size = "md",
  onItemClick,
  selectedId = null,
}: AvatarGroupProps) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const visibleItems = items.slice(0, maxVisible);
  const remainingCount = items.length - maxVisible;

  return (
    <div className={cn("flex items-center justify-center", className)}>
      {visibleItems.map((item, index) => (
        <div key={item.id} className={cn(selectedId === item.id && "ring-2 ring-emerald-400 rounded-full")}> 
          <Avatar
            item={item}
            index={index}
            totalItems={visibleItems.length}
            size={size}
            isHovered={hoveredIndex === item.id}
            onHover={() => setHoveredIndex(item.id)}
            onLeave={() => setHoveredIndex(null)}
            onClick={() => onItemClick?.(item)}
            selected={selectedId === item.id}
          />
        </div>
      ))}

      {remainingCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className={cn(
            "flex items-center justify-center rounded-full border-2 border-background bg-muted text-muted-foreground font-medium",
            size === "sm"
              ? "h-8 w-8"
              : size === "md"
              ? "h-10 w-10"
              : "h-12 w-12",
            "ml-[-0.5rem]"
          )}
        >
          +{remainingCount}
        </motion.div>
      )}
    </div>
  );
};

export default AvatarGroup;
