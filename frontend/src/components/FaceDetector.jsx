import { useEffect, useRef, useState } from 'react';
import { FaceDetector, FilesetResolver } from '@mediapipe/tasks-vision';
import { Eye, EyeOff } from 'lucide-react';

export default function PresenceDetector({ onPresenceChange }) {
    const videoRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState('');
    const [isHidden, setIsHidden] = useState(false);
    const detectorRef = useRef(null);
    const intervalRef = useRef(null);

    useEffect(() => {
        let active = true;
        async function init() {
            try {
                const vision = await FilesetResolver.forVisionTasks(
                    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
                );
                const faceDetector = await FaceDetector.createFromOptions(vision, {
                    baseOptions: {
                        modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite`,
                        delegate: "CPU"
                    },
                    runningMode: "VIDEO"
                });

                if (!active) return;
                detectorRef.current = faceDetector;

                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
                setIsLoaded(true);
            } catch (err) {
                if (active) setError('Camera or AI model failed to load.');
                console.error(err);
            }
        }
        init();

        return () => {
            active = false;
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (videoRef.current && videoRef.current.srcObject) {
                const tracks = videoRef.current.srcObject.getTracks();
                tracks.forEach(track => track.stop());
            }
            if (detectorRef.current) detectorRef.current.close();
        };
    }, []);

    useEffect(() => {
        if (!isLoaded || !videoRef.current || !detectorRef.current) return;

        intervalRef.current = setInterval(() => {
            if (videoRef.current.currentTime > 0) {
                const detections = detectorRef.current.detectForVideo(videoRef.current, performance.now());
                const hasFace = detections.detections.length > 0;
                onPresenceChange(hasFace);
            }
        }, 3000); // Check every 3 seconds

        return () => clearInterval(intervalRef.current);
    }, [isLoaded, onPresenceChange]);

    return (
        <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden border border-white/10 shadow-lg group">
            <video ref={videoRef} className={`w-full h-full object-cover transition-opacity duration-300 ${isHidden ? 'opacity-0' : 'opacity-100'}`} autoPlay playsInline muted />

            <button
                onClick={() => setIsHidden(!isHidden)}
                className="absolute top-1 right-1 p-1 bg-black/60 hover:bg-black/90 rounded-md text-white/70 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
                title={isHidden ? "Show Camera" : "Hide Camera"}
            >
                {isHidden ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>

            {isHidden && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900/95 text-[10px] text-textMuted z-10 pointer-events-none">
                    <EyeOff size={16} className="mb-1 opacity-50" />
                    Hidden
                </div>
            )}

            {!isLoaded && !error && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-900/80 text-[10px] text-center p-2 text-textMuted z-10 animate-pulse pointer-events-none">
                    Starting Engine...
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/80 text-[10px] text-center p-2 text-red-200 z-10 pointer-events-none">
                    {error}
                </div>
            )}
        </div>
    );
}
