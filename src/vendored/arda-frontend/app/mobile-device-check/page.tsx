'use client';

import { Smartphone, Laptop } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { MobileScanView } from '@frontend/components/scan/MobileScanView';
import { DesktopScanView } from '@frontend/components/scan/DesktopScanView';
import { AppSidebar } from '@frontend/components/app-sidebar';
import { AppHeader } from '@frontend/components/common/app-header';
import { SidebarProvider, SidebarInset } from '@frontend/components/ui/sidebar';

export default function MobileDeviceCheckPage() {
  const router = useRouter();
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [mobileScanViewOpen, setMobileScanViewOpen] = useState(false);

  const handleScanComplete = (scannedData: string) => {
    console.log('Scanned data:', scannedData);
  };

  const handleMobileDeviceClick = () => {
    setMobileScanViewOpen(true);
  };

  const handleDesktopBrowserClick = () => {
    setScanModalOpen(true);
  };

  return (
    <>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset className='overflow-hidden h-screen'>
          <AppHeader />
          <div className='w-full flex flex-col flex-1 min-h-0 overflow-hidden h-full'>
            <div className='relative rounded-none bg-[#d94a1f] w-full h-full overflow-hidden flex flex-col items-start p-0 box-border m-0'>
              <div className='absolute inset-0 w-full h-full overflow-hidden z-0'>
                <svg
                  className='absolute inset-0 w-full h-full object-cover'
                  viewBox='0 0 1712 1024'
                  preserveAspectRatio='xMidYMid slice'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <g
                    style={{ mixBlendMode: 'luminosity' }}
                    clipPath='url(#clip0_61_18947)'
                  >
                    <path d='M1712 1024H0V0H1712V1024Z' fill='#d94a1f' />
                    <g style={{ mixBlendMode: 'plus-lighter' }}>
                      <g opacity='0.5'>
                        <mask
                          id='mask0_61_18947'
                          style={{ maskType: 'luminance' }}
                          maskUnits='userSpaceOnUse'
                          x='0'
                          y='0'
                          width='1712'
                          height='1024'
                        >
                          <path d='M1712 1024H0V0H1712V1024Z' fill='white' />
                        </mask>
                        <g mask='url(#mask0_61_18947)'>
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M262.645 1538L-461.491 767.99L530.111 -286.424L1254.25 483.582L262.645 1538Z'
                            fill='url(#paint1_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M1288.58 1509.61L564.439 739.602L1556.04 -314.813L2280.18 455.193L1288.58 1509.61Z'
                            fill='url(#paint2_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M853.794 1258.17L129.657 488.164L1121.26 -566.25L1845.4 203.756L853.794 1258.17Z'
                            fill='url(#paint3_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M899.969 790.145L569.803 439.064L1021.92 -41.6894L1352.08 309.391L899.969 790.145Z'
                            fill='url(#paint4_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M926.556 489.461L596.39 138.381L1048.5 -342.373L1378.67 8.7073L926.556 489.461Z'
                            fill='url(#paint5_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M8.14885 489.461L-322.017 138.381L130.098 -342.373L460.264 8.70728L8.14885 489.461Z'
                            fill='url(#paint6_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M-83.7504 1107.16L-200.866 982.625L843.827 -128.244L960.943 -3.70896L-83.7504 1107.16Z'
                            fill='url(#paint7_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M-200.867 62.3686L-83.7511 -62.166L960.943 1048.7L843.827 1173.24L-200.867 62.3686Z'
                            fill='url(#paint8_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M587.123 548.496L256.957 197.416L709.072 -283.338L1039.24 67.7424L587.123 548.496Z'
                            fill='url(#paint9_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M1335.59 455.225L1005.43 104.145L1457.54 -376.609L1787.71 -25.5291L1335.59 455.225Z'
                            fill='url(#paint10_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M1361.34 905.373L1031.17 554.293L1483.29 73.5391L1813.45 424.619L1361.34 905.373Z'
                            fill='url(#paint11_linear_61_18947)'
                          />
                          <path
                            style={{ mixBlendMode: 'screen' }}
                            opacity='0.5'
                            d='M1335.59 1141.61L1005.43 790.525L1457.54 309.772L1787.71 660.852L1335.59 1141.61Z'
                            fill='url(#paint12_linear_61_18947)'
                          />
                        </g>
                      </g>
                    </g>
                  </g>
                  <defs>
                    <linearGradient
                      id='paint1_linear_61_18947'
                      x1='-99.1702'
                      y1='1152.4'
                      x2='961.699'
                      y2='154.729'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint2_linear_61_18947'
                      x1='931.361'
                      y1='1119.93'
                      x2='1992.23'
                      y2='122.257'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint3_linear_61_18947'
                      x1='495.536'
                      y1='869.07'
                      x2='1556.41'
                      y2='-128.603'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint4_linear_61_18947'
                      x1='800.802'
                      y1='673.742'
                      x2='1284.02'
                      y2='213.802'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint5_linear_61_18947'
                      x1='768.372'
                      y1='306.332'
                      x2='1252.07'
                      y2='-148.55'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint6_linear_61_18947'
                      x1='-154.065'
                      y1='309.873'
                      x2='329.632'
                      y2='-145.009'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint7_linear_61_18947'
                      x1='-143.284'
                      y1='1045.19'
                      x2='967.409'
                      y2='0.656601'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint8_linear_61_18947'
                      x1='-143.039'
                      y1='0.475537'
                      x2='967.65'
                      y2='1045'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0.8)' />
                      <stop offset='0.08' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='0.2' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.33' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.45' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.58' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.71' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.85' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0)' />
                    </linearGradient>
                    <linearGradient
                      id='paint9_linear_61_18947'
                      x1='427.253'
                      y1='366.941'
                      x2='910.949'
                      y2='-87.9412'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint10_linear_61_18947'
                      x1='1179.32'
                      y1='270.359'
                      x2='1663.02'
                      y2='-184.523'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint11_linear_61_18947'
                      x1='1203.64'
                      y1='722.385'
                      x2='1687.34'
                      y2='267.503'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <linearGradient
                      id='paint12_linear_61_18947'
                      x1='1176.98'
                      y1='959.75'
                      x2='1660.67'
                      y2='504.868'
                      gradientUnits='userSpaceOnUse'
                    >
                      <stop stopColor='rgba(252, 90, 41, 0)' />
                      <stop offset='0.15' stopColor='rgba(252, 90, 41, 0.1)' />
                      <stop offset='0.29' stopColor='rgba(252, 90, 41, 0.2)' />
                      <stop offset='0.42' stopColor='rgba(252, 90, 41, 0.3)' />
                      <stop offset='0.55' stopColor='rgba(252, 90, 41, 0.4)' />
                      <stop offset='0.67' stopColor='rgba(252, 90, 41, 0.5)' />
                      <stop offset='0.8' stopColor='rgba(252, 90, 41, 0.6)' />
                      <stop offset='0.92' stopColor='rgba(252, 90, 41, 0.7)' />
                      <stop offset='1' stopColor='rgba(252, 90, 41, 0.8)' />
                    </linearGradient>
                    <clipPath id='clip0_61_18947'>
                      <rect
                        width='1712'
                        height='1024'
                        fill='white'
                        transform='matrix(1 0 0 -1 0 1024)'
                      />
                    </clipPath>
                  </defs>
                </svg>
              </div>
              <div className='w-full h-full flex flex-col items-start justify-center z-[1] px-4 sm:px-6 md:px-10 lg:px-20 xl:px-[120px] box-border gap-6 sm:gap-8 md:gap-10 lg:gap-12'>
                <div className='w-full flex flex-col items-start justify-start'>
                  <b className='w-full max-w-[1400px] relative leading-[1.1] block text-[28px] sm:text-[36px] md:text-[44px] lg:text-[52px] xl:text-[60px] m-0 break-words text-white mb-4 sm:mb-6 md:mb-8'>
                    Mobile device check
                  </b>
                </div>
                <div className="relative w-full max-w-full sm:max-w-[400px] md:max-w-[420px] lg:max-w-[440px] xl:max-w-[460px] flex flex-col items-start gap-3 sm:gap-4 md:gap-5 text-base text-[#0a0a0a] font-['Open_Sans'] z-[2]">
                  <div
                    className='w-full relative shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-[14px] bg-white border border-[#e5e5e5] box-border flex flex-col items-start p-4 sm:p-5 md:p-6 text-left cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.1)] active:scale-[0.98]'
                    onClick={handleMobileDeviceClick}
                  >
                    <div className='w-full flex items-center relative gap-3 sm:gap-4'>
                      <Smartphone
                        className='w-8 h-8 sm:w-10 sm:h-10 relative max-h-full z-0 text-black flex-shrink-0 stroke-black'
                        width={40}
                        height={40}
                      />
                      <div className='flex-1 flex flex-col items-start gap-0.5 z-[1] min-w-0'>
                        <div className='w-full relative tracking-[-0.4px] leading-6 font-semibold text-sm sm:text-base truncate'>
                          Is mobile device
                        </div>
                        <div className='w-full relative text-xs sm:text-sm leading-5 text-[#737373] line-clamp-2'>
                          Use this path if user is on mobile device
                        </div>
                      </div>
                      <div className='!m-0 absolute top-0 right-0 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-lg bg-[#fc5a29] border border-transparent overflow-hidden flex items-center justify-center py-0.5 px-2 z-[2] text-xs text-[#fafafa] flex-shrink-0'>
                        <div className='relative leading-4 font-semibold whitespace-nowrap'>
                          Mobile
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    className='w-full relative shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-[14px] bg-white border border-[#e5e5e5] box-border flex flex-col items-start p-4 sm:p-5 md:p-6 text-left cursor-pointer transition-all duration-200 ease-in-out hover:-translate-y-0.5 hover:shadow-[0px_4px_6px_rgba(0,0,0,0.1),0px_2px_4px_-1px_rgba(0,0,0,0.1)] active:scale-[0.98]'
                    onClick={handleDesktopBrowserClick}
                  >
                    <div className='w-full flex items-center relative gap-3 sm:gap-4'>
                      <Laptop
                        className='w-8 h-8 sm:w-10 sm:h-10 relative max-h-full z-0 text-black flex-shrink-0 stroke-black'
                        width={40}
                        height={40}
                      />
                      <div className='flex-1 flex flex-col items-start gap-0.5 z-[1] min-w-0'>
                        <div className='w-full relative tracking-[-0.4px] leading-6 font-semibold text-sm sm:text-base truncate'>
                          Is desktop browser
                        </div>
                        <div className='w-full relative text-xs sm:text-sm leading-5 text-[#737373] line-clamp-2'>
                          If user is on a desktop browser
                        </div>
                      </div>
                      <div className='!m-0 absolute top-0 right-0 shadow-[0px_1px_3px_rgba(0,0,0,0.1),0px_1px_2px_-1px_rgba(0,0,0,0.1)] rounded-lg bg-[#fc5a29] border border-transparent overflow-hidden flex items-center justify-center py-0.5 px-2 z-[2] text-xs text-[#fafafa] flex-shrink-0'>
                        <div className='relative leading-4 font-semibold whitespace-nowrap'>
                          Desktop
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>

      {mobileScanViewOpen && (
        <MobileScanView
          onScan={handleScanComplete}
          onClose={() => {
            setMobileScanViewOpen(false);
            router.back();
          }}
        />
      )}

      {scanModalOpen && (
        <DesktopScanView
          isOpen={scanModalOpen}
          onClose={() => {
            setScanModalOpen(false);
            router.back();
          }}
          onScan={handleScanComplete}
        />
      )}
    </>
  );
}
