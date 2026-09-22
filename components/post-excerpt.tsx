"use client";
import { useLayoutEffect, useRef, useState } from 'react';

// Measure using the actual font and available width so the five dots fit inside line three.
export function PostExcerpt({ text }: { text: string }) {
  const container = useRef<HTMLSpanElement>(null);
  const probe = useRef<HTMLSpanElement>(null);
  const [excerpt, setExcerpt] = useState(text);
  useLayoutEffect(() => {
    const box = container.current, measure = probe.current;
    if (!box || !measure) return;
    let active = true;
    const characters = Array.from(text);
    function update() {
      if (!active || !box || !measure || !box.clientWidth) return;
      const height = parseFloat(getComputedStyle(measure).lineHeight) * 3;
      measure.textContent = text;
      if (measure.getBoundingClientRect().height <= height + 0.5) { setExcerpt(text); return; }
      let low = 0, high = characters.length;
      while (low < high) {
        const middle = Math.ceil((low + high) / 2);
        measure.textContent = characters.slice(0, middle).join('').trimEnd() + '.....';
        if (measure.getBoundingClientRect().height <= height + 0.5) low = middle;
        else high = middle - 1;
      }
      setExcerpt(characters.slice(0, low).join('').trimEnd() + '.....');
    }
    update();
    const observer = new ResizeObserver(update);
    observer.observe(box);
    void document.fonts.ready.then(update);
    return () => { active = false; observer.disconnect(); };
  }, [text]);
  return <span className="post-text post-excerpt" ref={container}>
    <span className="post-excerpt-visible">{excerpt}</span>
    <span className="post-excerpt-probe" ref={probe} aria-hidden="true" />
  </span>;
}
