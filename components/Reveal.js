'use client';

import { useReveal } from '@/lib/useReveal';

// Wraps any element/section so it fades + slides up into place the
// first time it scrolls into the viewport. Stagger children by
// passing an increasing `delay` (ms).
//
//   <Reveal delay={i * 90}><FeatureCard /></Reveal>
export default function Reveal({
  children,
  as: Tag = 'div',
  className = '',
  delay = 0,
  ...rest
}) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' reveal-visible' : ''}${
        className ? ` ${className}` : ''
      }`}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
