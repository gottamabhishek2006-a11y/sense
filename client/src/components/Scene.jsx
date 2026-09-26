import React from 'react';
import { SylvaLivingWorldScene } from '@designcodeio/threeui';
import '@designcodeio/threeui/style.css';

export function Scene() {
  return (
    <div className="shader-frame" aria-hidden="true">
      <SylvaLivingWorldScene variant="living-green" />
    </div>
  );
}

export default Scene;
