'use client';

import React, { useEffect } from 'react';

export default function DebugInfo() {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      console.log('Debug info: Application loaded successfully');
      console.log('Current URL:', window.location.href);
      console.log('Hostname:', window.location.hostname);
      console.log('Port:', window.location.port);
      console.log('Protocol:', window.location.protocol);
    }
  }, []);
  
  return null;
} 