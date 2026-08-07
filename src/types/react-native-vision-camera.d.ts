declare module 'react-native-vision-camera' {
  type CameraPosition = 'back' | 'front';

  interface CameraDevice {
    id: string;
    position: CameraPosition;
    name: string;
    hasPhoto: boolean;
    hasVideo: boolean;
    hasRawPhoto: boolean;
    hasRawVideo: boolean;
    supportsFocus: boolean;
    supportsRawFocus: boolean;
    isColorInverted: boolean;
    videoWidth: number;
    videoHeight: number;
    photoWidth: number;
    photoHeight: number;
    pixelFormat: 'unknown' | 'yuv' | 'rgb';
  }

  interface Code {
    type: string;
    displayValue: string | null;
    data: string;
  }

  interface CodeScanner {
    codeTypes: string[];
    onCodeScanned: (codes: Code[]) => void;
  }

  interface CameraPermissionStatus {
    hasPermission: boolean;
    requestPermission: () => Promise<'authorized' | 'denied'>;
  }

  interface CameraProps {
    device: CameraDevice;
    isActive: boolean;
    codeScanner: CodeScanner | null;
    style?: any;
    [key: string]: any;
  }

  export const Camera: React.FC<CameraProps>;
  export function useCameraDevice(position: CameraPosition): CameraDevice | null;
  export function useCodeScanner(options: {codeTypes: string[]; onCodeScanned: (codes: Code[]) => void}): CodeScanner | null;
  export function useCameraPermission(): CameraPermissionStatus;
}
