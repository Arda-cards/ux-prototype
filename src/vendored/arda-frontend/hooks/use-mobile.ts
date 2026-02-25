import * as React from "react"

const MOBILE_BREAKPOINT = 768

/**
 * Detects if the device is a mobile device based on:
 * 1. User-Agent string (primary check for actual mobile devices)
 * 2. Browser platform detection (Windows, Mac, Linux = desktop)
 * 3. Touch points and device capabilities
 * 
 * This prevents desktop browsers with split screens or DevTools mobile emulation
 * from being detected as mobile.
 */
function detectMobileDevice(): boolean {
  if (typeof window === 'undefined') {
    return false
  }

  const userAgent = window.navigator.userAgent || ''
  const platform = window.navigator.platform || ''
  
  // PRIMARY CHECK: Detect desktop operating systems
  // navigator.platform is NOT modified by DevTools mobile emulation
  // Desktop platforms: MacIntel, Win32, Linux x86_64, etc.
  const desktopPlatforms = /win32|win64|windows|macintosh|macintel|mac|linux|x11|freebsd|openbsd/i
  const isDesktopPlatform = desktopPlatforms.test(platform)
  
  // If platform indicates desktop, it's NOT mobile (even if User-Agent was modified by DevTools)
  // This is the key fix: DevTools can change User-Agent but NOT platform
  if (isDesktopPlatform) {
    return false
  }
  
  // SECONDARY CHECK: Check User-Agent for mobile device patterns
  // Only relevant if platform doesn't indicate desktop
  const mobileRegex = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i
  const isMobileUserAgent = mobileRegex.test(userAgent)
  
  // For tablets (iPad, Android tablets), always use mobile view
  const isTablet = /ipad|android(?!.*mobile)|tablet/i.test(userAgent)
  if (isTablet) {
    return true
  }
  
  // If User-Agent indicates mobile device, it's mobile
  if (isMobileUserAgent) {
    return true
  }

  // FALLBACK: If we can't determine from platform/User-Agent, use screen size
  // But this should rarely be needed
  const isSmallScreen = window.innerWidth < MOBILE_BREAKPOINT
  if (isSmallScreen) {
    return true
  }

  // Default to desktop
  return false
}

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(detectMobileDevice())
    }

    // Initial check
    checkMobile()

    // Listen for resize events (but still use device detection, not just size)
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      checkMobile()
    }
    
    mql.addEventListener("change", onChange)
    window.addEventListener("resize", checkMobile)

    return () => {
      mql.removeEventListener("change", onChange)
      window.removeEventListener("resize", checkMobile)
    }
  }, [])

  return !!isMobile
}
