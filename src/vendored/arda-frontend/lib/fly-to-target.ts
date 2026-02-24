// src/lib/fly-to-target.ts
export type FlyToOptions = {
  fromEl: Element;
  toEl: Element;
  imageSrc: string;
  duration?: number;
  size?: number;
  zIndex?: number;
  endOffsetX?: number;
  endOffsetY?: number;
};

export const flyToTarget = ({
  fromEl,
  toEl,
  imageSrc,
  duration = 3000,
  size = 120,
  zIndex = 9999,
  endOffsetX = 0,
  endOffsetY = 0,
}: FlyToOptions): Promise<void> => {
  const fromRect = fromEl.getBoundingClientRect();
  const toRect = toEl.getBoundingClientRect();

  // Start and end coordinates (with offsets)
  const startX = fromRect.left + fromRect.width / 2;
  const startY = fromRect.top + fromRect.height / 2;
  const endX = toRect.left + toRect.width / 2 + endOffsetX;
  const endY = toRect.top + toRect.height / 2 + endOffsetY;

  // Create the floating element
  const img = document.createElement('img');
  img.src = imageSrc;
  img.alt = 'flying';
  img.style.position = 'fixed';
  img.style.left = `${startX - size / 2}px`;
  img.style.top = `${startY - size / 2}px`;
  img.style.width = `${size}px`;
  img.style.height = `${size}px`;
  img.style.pointerEvents = 'none';
  img.style.zIndex = String(zIndex);
  img.style.transform = 'translate3d(0,0,0) scale(1)';
  img.style.willChange = 'transform, opacity';
  document.body.appendChild(img);

  const dx = endX - startX;
  const dy = endY - startY;
  const ctrlY = -Math.min(120, Math.abs(dy) * 0.5); // arc upward

  const anim = img.animate(
    [
      {
        transform: `translate3d(0px, 0px, 0) scale(1)`,
        opacity: 1,
        offset: 0,
      },
      {
        transform: `translate3d(${dx * 0.6}px, ${
          dy * 0.6 + ctrlY
        }px, 0) scale(0.9)`,
        opacity: 0.9,
        offset: 0.6,
      },
      {
        // 👉 shrink + fade out when arriving
        transform: `translate3d(${dx}px, ${dy}px, 0) scale(0.2)`,
        opacity: 0,
        offset: 1,
      },
    ],
    {
      duration,
      easing: 'cubic-bezier(.22,.61,.36,1)',
      fill: 'forwards',
    }
  );

  return new Promise<void>((resolve) => {
    anim.onfinish = () => {
      img.remove();
      resolve();
    };
    anim.oncancel = () => {
      img.remove();
      resolve();
    };
  });
};
