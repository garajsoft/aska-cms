"use client";

import { useEffect } from "react";

export function RichTextStyles() {
  useEffect(() => {
    // Enable drag-to-resize for images in Lexical editor
    const editor = document.querySelector("[data-lexical-editor]");
    if (!editor) return;

    const images = editor.querySelectorAll("img");
    images.forEach((img: HTMLImageElement) => {
      if (img.style.display === "none") return;

      // Create wrapper if needed
      if (!img.parentElement?.classList.contains("lexical-image-wrapper")) {
        const wrapper = document.createElement("div");
        wrapper.className = "lexical-image-wrapper";
        img.parentElement?.insertBefore(wrapper, img);
        wrapper.appendChild(img);
      }

      const wrapper = img.closest(".lexical-image-wrapper") as HTMLElement;
      if (!wrapper) return;

      // Mark as resizable
      wrapper.style.position = "relative";
      wrapper.style.display = "inline-block";

      // Add resize handle
      let handle = wrapper.querySelector(".resize-handle") as HTMLElement;
      if (!handle) {
        handle = document.createElement("div");
        handle.className = "resize-handle";
        wrapper.appendChild(handle);
      }

      // Drag to resize functionality
      let isResizing = false;
      let startX = 0;
      let startY = 0;
      let startWidth = 0;
      let startHeight = 0;

      handle.addEventListener("mousedown", (e: MouseEvent) => {
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startWidth = img.offsetWidth;
        startHeight = img.offsetHeight;
        img.style.cursor = "grabbing";
        e.preventDefault();
      });

      document.addEventListener("mousemove", (e: MouseEvent) => {
        if (!isResizing) return;

        const deltaX = e.clientX - startX;
        const deltaY = e.clientY - startY;
        const newWidth = Math.max(100, startWidth + deltaX);
        const aspectRatio = startHeight / startWidth;
        const newHeight = newWidth * aspectRatio;

        img.style.width = newWidth + "px";
        img.style.height = newHeight + "px";
      });

      document.addEventListener("mouseup", () => {
        if (isResizing) {
          isResizing = false;
          img.style.cursor = "grab";
        }
      });
    });
  }, []);

  return (
    <style>{`
      /* Lexical editor image styling */
      [data-lexical-editor] img {
        cursor: grab;
        user-select: none;
        max-width: 100%;
        height: auto;
      }

      [data-lexical-editor] img:active {
        cursor: grabbing;
      }

      /* Image wrapper with resize handle */
      .lexical-image-wrapper {
        position: relative;
        display: inline-block;
      }

      .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 24px;
        height: 24px;
        background: linear-gradient(135deg, transparent 50%, #667eea 50%);
        cursor: se-resize;
        opacity: 0;
        transition: opacity 0.2s;
        pointer-events: all;
      }

      .lexical-image-wrapper:hover .resize-handle {
        opacity: 0.7;
      }

      .resize-handle:hover {
        opacity: 1;
      }

      /* Lexical figure elements */
      [data-lexical-editor] figure {
        margin: 1em 0;
        position: relative;
      }

      [data-lexical-editor] figcaption {
        font-size: 0.9em;
        color: #666;
        margin-top: 0.5em;
        font-style: italic;
      }
    `}</style>
  );
}
