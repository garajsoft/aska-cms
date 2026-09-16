"use client";

import { useEffect } from "react";

export function RichTextStyles() {
  useEffect(() => {
    // Setup resize functionality for all images
    const setupImageResize = () => {
      const editor = document.querySelector("[data-lexical-editor]");
      if (!editor) return;

      const images = editor.querySelectorAll("img:not(.resizable-setup)");
      images.forEach((img: any) => {
        if (img.style.display === "none" || img.classList.contains("resizable-setup")) return;

        img.classList.add("resizable-setup");

        // Create wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "lexical-image-wrapper";
        wrapper.style.position = "relative";
        wrapper.style.display = "inline-block";
        wrapper.style.margin = "0";

        img.parentElement?.insertBefore(wrapper, img);
        wrapper.appendChild(img);

        // Create and add visible resize handle
        const handle = document.createElement("div");
        handle.className = "resize-handle";
        handle.setAttribute("data-resize-handle", "true");
        wrapper.appendChild(handle);

        // Resize logic
        let isResizing = false;
        let startX = 0;
        let startY = 0;
        let startWidth = 0;
        let startHeight = 0;

        const onMouseDown = (e: MouseEvent) => {
          if (e.target !== handle) return;
          isResizing = true;
          startX = e.clientX;
          startY = e.clientY;
          startWidth = img.offsetWidth;
          startHeight = img.offsetHeight;
          document.body.style.cursor = "se-resize";
          e.preventDefault();
          e.stopPropagation();
        };

        const onMouseMove = (e: MouseEvent) => {
          if (!isResizing) return;
          const deltaX = e.clientX - startX;
          const newWidth = Math.max(100, startWidth + deltaX);
          const aspectRatio = startHeight / startWidth;
          const newHeight = newWidth * aspectRatio;
          img.style.width = newWidth + "px";
          img.style.height = newHeight + "px";
        };

        const onMouseUp = () => {
          if (isResizing) {
            isResizing = false;
            document.body.style.cursor = "auto";
          }
        };

        handle.addEventListener("mousedown", onMouseDown);
        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
      });
    };

    // Initial setup
    setupImageResize();

    // Watch for new images added to editor
    const editor = document.querySelector("[data-lexical-editor]");
    if (editor) {
      const observer = new MutationObserver(() => {
        setupImageResize();
      });
      observer.observe(editor, { childList: true, subtree: true });
      return () => observer.disconnect();
    }
  }, []);

  return (
    <style>{`
      /* Lexical editor image styling */
      [data-lexical-editor] img.resizable-setup {
        max-width: 100%;
        height: auto;
        user-select: none;
      }

      /* Image wrapper with resize handle */
      .lexical-image-wrapper {
        position: relative !important;
        display: inline-block !important;
        margin: 0 !important;
      }

      .lexical-image-wrapper:hover {
        outline: 2px dashed #667eea;
        outline-offset: 2px;
      }

      /* Resize handle - always visible on hover */
      .resize-handle {
        position: absolute;
        bottom: -8px;
        right: -8px;
        width: 28px;
        height: 28px;
        background: #667eea;
        border-radius: 4px;
        cursor: se-resize;
        opacity: 0;
        transition: opacity 0.15s ease;
        pointer-events: auto;
        z-index: 100;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      }

      .resize-handle::after {
        content: '↘';
        color: white;
        font-size: 16px;
        font-weight: bold;
        line-height: 1;
      }

      .lexical-image-wrapper:hover .resize-handle {
        opacity: 1;
      }

      .resize-handle:active {
        background: #5568d3;
        opacity: 1;
      }

      /* Lexical figure elements */
      [data-lexical-editor] figure {
        margin: 1em 0;
        position: relative;
      }

      [data-lexical-editor] figure img {
        max-width: 100%;
        height: auto;
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
