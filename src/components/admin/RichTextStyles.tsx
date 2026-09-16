"use client";

export function RichTextStyles() {
  return (
    <style>{`
      /* Enable drag-to-resize for images in Lexical editor */
      .editor-shell img,
      .rich-text-editor img,
      [data-lexical-editor] img {
        max-width: 100%;
        height: auto;
        cursor: grab;
        user-select: none;
      }

      [data-lexical-editor] img:active {
        cursor: grabbing;
      }

      /* Resizable image container */
      [data-lexical-editor] .editor-image,
      [data-lexical-editor] [data-type="image"] {
        position: relative;
        display: inline-block;
      }

      /* Image wrapper with resize handles */
      [data-lexical-editor] .image-wrapper {
        position: relative;
        display: inline-block;
      }

      [data-lexical-editor] .image-wrapper::after {
        content: '';
        position: absolute;
        bottom: 0;
        right: 0;
        width: 20px;
        height: 20px;
        background: linear-gradient(135deg, transparent 50%, #667eea 50%);
        cursor: se-resize;
        opacity: 0;
        transition: opacity 0.2s;
      }

      [data-lexical-editor] .image-wrapper:hover::after {
        opacity: 0.5;
      }

      /* Make images in rich text resizable */
      [data-lexical-editor] img {
        resize: both;
        overflow: auto;
      }

      /* Lexical editor figure elements */
      [data-lexical-editor] figure {
        margin: 1em 0;
        position: relative;
      }

      [data-lexical-editor] figure img {
        width: 100%;
        height: auto;
        display: block;
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
