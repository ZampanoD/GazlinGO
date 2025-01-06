//Сложный компонент для интерактивного отображения 3D-моделей минералов с использованием Three.js и React Three Fiber.
//Включает расширенные возможности управления: автоматическое вращение, улучшенное освещение, настраиваемую сетку и темную тему.
//Реализует систему управления камерой через OrbitControls, динамическую загрузку моделей с индикатором прогресса, систему теней и кастомное освещение.
//Поддерживает добавление в избранное для авторизованных пользователей с анимированной звездочкой и панель управления с настройками визуализации.
// Особое внимание уделено производительности через использование Suspense и правильную обработку ресурсов Three.js.


import React, { useEffect, useState, Suspense, useRef } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import * as THREE from 'three';
import { GLTFLoader } from 'three-stdlib';
import { useLanguage } from '../contexts/LanguageContext';

interface DefaultModelConfig {
    path: string;
    title: string;
}

const DEFAULT_MODEL: DefaultModelConfig = {
    path: '/assets/Goblin_head.glb',
    title: 'GazlinGO Demo Model'
};

interface ModelViewerProps {
    modelPath?: string;
    mineralId?: number;
    isFavorite?: boolean;
    onFavoriteToggle?: (mineralId: number) => void;
    isAuthenticated: boolean;
    isDefaultModel?: boolean;
}

const FavoriteStar = ({ isFavorite, onClick, isDarkTheme }: {
    isFavorite: boolean;
    onClick: () => void;
    isDarkTheme: boolean;
}) => {
    const [favorite, setFavorite] = useState(isFavorite);

    useEffect(() => {
        setFavorite(isFavorite);
    }, [isFavorite]);

    const handleClick = () => {
        setFavorite(!favorite);
        onClick();
    };

    return (
        <button
            onClick={handleClick}
            className="absolute top-4 left-4 z-10"
        >
            <svg
                className={`w-6 h-6 ${
                    favorite
                        ? 'text-yellow-400 fill-current'
                        : isDarkTheme
                            ? 'text-white fill-current'
                            : 'text-gray-700 stroke-current'
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill={favorite ? 'currentColor' : 'none'}
                strokeWidth={favorite ? '0' : '2'}
            >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
        </button>
    );
};

const ToggleSwitch = ({ isOn, onToggle, label }: { isOn: boolean; onToggle: () => void; label: string }) => (
    <div className="relative inline-block">
        <label className="relative inline-flex items-center cursor-pointer gap-2" title={label}>
            <input
                type="checkbox"
                className="sr-only peer"
                checked={isOn}
                onChange={onToggle}
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="text-sm text-gray-700 font-medium">{label}</span>
        </label>
    </div>
);

const LoadingSpinner = () => (
    <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
);

const DenseGridFloor = () => (
    <Grid
        position={[0, -1, 0]}
        args={[20, 20]}
        cellSize={0.2}
        cellThickness={0.5}
        cellColor="#1f2937"
        sectionSize={1}
        sectionThickness={1}
        sectionColor="#374151"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
    />
);

const Model: React.FC<{
    url: string;
    autoRotate: boolean;
    onError: (error: string) => void;
}> = ({ url, autoRotate, onError }) => {
    const [scene, setScene] = useState<THREE.Object3D | null>(null);
    const modelRef = useRef<THREE.Group>(null);

    useFrame(() => {
        if (modelRef.current && autoRotate) {
            modelRef.current.rotation.y += 0.005;
        }
    });

    useEffect(() => {
        const loader = new GLTFLoader();
        const fullModelPath = url.startsWith('/storage') ? `http://localhost:8080${url}` : url;
        console.log('Loading model from path:', fullModelPath);

        loader.load(
            fullModelPath,
            (gltf) => {
                gltf.scene.traverse((child) => {
                    if (child instanceof THREE.Mesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });


                const box = new THREE.Box3().setFromObject(gltf.scene);
                const center = box.getCenter(new THREE.Vector3());
                const size = box.getSize(new THREE.Vector3());
                const maxDim = Math.max(size.x, size.y, size.z);
                const scale = 2 / maxDim;

                gltf.scene.position.copy(center.multiplyScalar(-1));
                gltf.scene.scale.setScalar(scale);

                setScene(gltf.scene);
            },
            undefined,
            (error) => {
                console.error('Error loading model:', error);
                onError(error.message);
            }
        );
    }, [url, onError]);

    if (!scene) return null;
    return <primitive ref={modelRef} object={scene} />;
};

const RotatingLights = () => {
    const { camera } = useThree();
    const lightGroup = useRef<THREE.Group>(null);

    useFrame(() => {
        if (lightGroup.current) {
            lightGroup.current.position.copy(camera.position);
            lightGroup.current.rotation.copy(camera.rotation);
        }
    });

    return (
        <group ref={lightGroup}>
            <directionalLight
                position={[-3, 3, 2]}
                intensity={2.5}
                castShadow
            />
            <directionalLight
                position={[3, 3, 2]}
                intensity={2.5}
                castShadow
            />
        </group>
    );
};

const Lights = ({ enhanced }: { enhanced: boolean }) => {
    if (!enhanced) return <ambientLight intensity={1} />;

    return (
        <>
            <spotLight
                position={[0, 8, 0]}
                intensity={4}
                angle={0.7}
                penumbra={0.5}
                castShadow
            />
            <RotatingLights />
        </>
    );
};

const ControlPanel = ({ children, darkTheme }: { children: React.ReactNode; darkTheme: boolean }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="absolute top-4 right-4 z-10 flex flex-col items-end">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`p-2 rounded-full transition-all duration-300 ${
                    darkTheme
                        ? 'hover:bg-white/20 bg-white/10'
                        : 'hover:bg-black/10 bg-black/5'
                }`}
            >
                <img
                    src="/gear.svg"
                    alt="Settings"
                    className={`w-6 h-6 ${darkTheme ? 'filter invert' : ''} ${
                        !isOpen ? 'hover:animate-[spin_3s_linear_infinite]' : ''
                    }`}
                />
            </button>
            <div className={`mt-2 ${isOpen ? 'block' : 'hidden'}`}>
                <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg shadow-md flex flex-col space-y-3">
                    {children}
                </div>
            </div>
        </div>
    );
};

const ModelViewer: React.FC<ModelViewerProps> = ({
                                                     modelPath,
                                                     mineralId,
                                                     isFavorite = false,
                                                     onFavoriteToggle,
                                                     isAuthenticated,
                                                     isDefaultModel = false
                                                 }) => {
    const [error, setError] = useState<string | null>(null);
    const [autoRotate, setAutoRotate] = useState(false);
    const [enhancedLighting, setEnhancedLighting] = useState(false);
    const [showGrid, setShowGrid] = useState(false);
    const [darkTheme, setDarkTheme] = useState(false);
    const { t } = useLanguage();

    const handleError = (errorMessage: string) => {
        setError(`${t('error')}: ${errorMessage}`);
    };

    const currentModelPath = isDefaultModel ? DEFAULT_MODEL.path : (modelPath || DEFAULT_MODEL.path);
    console.log('ModelViewer using path:', currentModelPath);

    if (error) {
        return <div className="flex justify-center items-center h-full text-red-500">{error}</div>;
    }

    return (
        <div className="relative w-full h-full border-2 border-gray-200 rounded-lg">
            {isAuthenticated && onFavoriteToggle && mineralId && !isDefaultModel && (
                <FavoriteStar
                    isFavorite={isFavorite}
                    onClick={() => onFavoriteToggle(mineralId)}
                    isDarkTheme={darkTheme}
                />
            )}
            <ControlPanel darkTheme={darkTheme}>
                <ToggleSwitch
                    isOn={autoRotate}
                    onToggle={() => setAutoRotate(!autoRotate)}
                    label={t('AutoRotate')}
                />
                <ToggleSwitch
                    isOn={enhancedLighting}
                    onToggle={() => setEnhancedLighting(!enhancedLighting)}
                    label={t('Lighting')}
                />
                <ToggleSwitch
                    isOn={showGrid}
                    onToggle={() => setShowGrid(!showGrid)}
                    label={t('Grid')}
                />
                <ToggleSwitch
                    isOn={darkTheme}
                    onToggle={() => setDarkTheme(!darkTheme)}
                    label={t('DarkTheme')}
                />
            </ControlPanel>

            <Canvas
                shadows
                dpr={[1, 2]}
                camera={{position: [0, 2, 5], fov: 45}}
                style={{background: darkTheme ? '#111827' : '#ffffff'}}
            >
                <Suspense fallback={<LoadingSpinner/>}>
                    <Lights enhanced={enhancedLighting} />
                    <Model
                        url={currentModelPath}
                        autoRotate={autoRotate}
                        onError={handleError}
                    />
                    {showGrid && <DenseGridFloor />}
                    <OrbitControls
                        minPolarAngle={0}
                        maxPolarAngle={Math.PI / 2}
                        enablePan={false}
                        enableDamping={true}
                        dampingFactor={0.05}
                        minDistance={2}
                        maxDistance={10}
                        enableRotate={!autoRotate}
                    />
                </Suspense>
            </Canvas>
        </div>
    );
};

export default ModelViewer;