import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export default function DynamicManifest() {
  const location = useLocation();

  useEffect(() => {
    let manifestPath = '/manifest.webmanifest';
    let themeColor = '#646cff';

    if (location.pathname.startsWith('/beautifulmind')) {
      manifestPath = '/beautifulmind/manifest.webmanifest';
      themeColor = '#4a90e2';
    } else if (location.pathname.startsWith('/games')) {
      manifestPath = '/games/manifest.webmanifest';
      themeColor = '#e24a90';
    }

    // Update manifest link
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (!manifestLink) {
      manifestLink = document.createElement('link');
      manifestLink.setAttribute('rel', 'manifest');
      document.head.appendChild(manifestLink);
    }
    manifestLink.setAttribute('href', manifestPath);

    // Update theme color
    let themeColorMeta = document.querySelector('meta[name="theme-color"]');
    if (!themeColorMeta) {
      themeColorMeta = document.createElement('meta');
      themeColorMeta.setAttribute('name', 'theme-color');
      document.head.appendChild(themeColorMeta);
    }
    themeColorMeta.setAttribute('content', themeColor);
  }, [location]);

  return null;
}
