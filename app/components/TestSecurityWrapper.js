'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TestSecurityWrapper({ children }) {
  const router = useRouter();
  const [warningCount, setWarningCount] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Handle tab visibility change
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleWarning('Tab switching detected!');
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  // Handle copy-paste prevention
  useEffect(() => {
    const preventCopyPaste = (e) => {
      e.preventDefault();
      handleWarning('Copying is not allowed during the test!');
    };

    const preventContextMenu = (e) => {
      e.preventDefault();
    };

    const preventKeyboardShortcuts = (e) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+P, Ctrl+S, F12
      if (
        (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'p' || e.key === 's')) ||
        e.key === 'F12' ||
        e.key === 'PrintScreen'
      ) {
        e.preventDefault();
        handleWarning('Keyboard shortcuts are disabled during the test!');
      }
    };

    document.addEventListener('copy', preventCopyPaste);
    document.addEventListener('paste', preventCopyPaste);
    document.addEventListener('contextmenu', preventContextMenu);
    document.addEventListener('keydown', preventKeyboardShortcuts);

    return () => {
      document.removeEventListener('copy', preventCopyPaste);
      document.removeEventListener('paste', preventCopyPaste);
      document.removeEventListener('contextmenu', preventContextMenu);
      document.removeEventListener('keydown', preventKeyboardShortcuts);
    };
  }, []);

  // Handle fullscreen
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          await document.documentElement.webkitRequestFullscreen();
        }
        setIsFullscreen(true);
      } catch (error) {
        console.error('Failed to enter fullscreen:', error);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement && !document.webkitFullscreenElement) {
        setIsFullscreen(false);
        handleWarning('Please stay in fullscreen mode during the test!');
      }
    };

    enterFullscreen();
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  const handleWarning = (message) => {
    setWarningCount((prev) => {
      const newCount = prev + 1;
      if (newCount >= 2) {
        // Auto-submit the test after 2 warnings
        alert('Maximum warnings reached. Your test will be submitted automatically.');
        router.push('/test-submission'); // Replace with your submission page route
        return prev;
      }
      alert(`Warning ${newCount}/2: ${message}`);
      return newCount;
    });
  };

  return (
    <div className="test-security-wrapper">
      {!isFullscreen && (
        <div className="fullscreen-warning" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.9)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
          textAlign: 'center'
        }}>
          <h2>Fullscreen Required</h2>
          <p>Please allow fullscreen mode to continue with the test.</p>
          <button
            onClick={() => document.documentElement.requestFullscreen()}
            style={{
              padding: '10px 20px',
              background: '#4a4a4a',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              marginTop: '20px'
            }}
          >
            Enter Fullscreen
          </button>
        </div>
      )}
  
      {/* ✅ Only render children when fullscreen is active */}
      {isFullscreen && children}
  
      <style jsx global>{`
        body {
          user-select: none;
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
        }
  
        .test-security-wrapper {
          min-height: 100vh;
        }
  
        @media print {
          body {
            display: none;
          }
        }
      `}</style>
    </div>
  );
  
} 