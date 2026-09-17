import { useEffect, useState} from 'react';
import logoDark from '../assets/DevVault-Logo2.png';
import logoLight from '../assets/DevVault-Logo-LightMode.png';

export default function LoadingScreen({ label = 'loading', duration = 10000, onComplete }){
    const [percent, setPercent] = useState(0);

    useEffect(() =>{
        let raf;
        const start = performance.now();

        function tick(now){
            const elapsed = now - start;
            const t = Math.min(elapsed / duration, 1);
            // ease-out cubic — fast start, gentle settle near 100, feels less robotic than linear
            const eased = 1 - Math.pow(1 - t, 3);
            setPercent(Math.round(eased * 100));

            if(t < 1){
                raf = requestAnimationFrame(tick);
            }else{
                setTimeout(() => onComplete?.(), 200); // brief hold at 100% before handing off
            }
        }
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
    }, [duration, onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-vault-bg">
            {/** 
            <div className="h-12 w-12 rounded-xl bg-vault-accent flex items-center justify-center text-white font-bold text-lg mb-8 shadow-glow">
                DV
            </div>*/}
            <div className="flex justify-center mb-5">
                <img
                    src={logoLight}
                    alt="DevVault"
                    className="w-30 h-auto object-contain dark:hidden"
                />
                <img
                    src={logoDark}
                    alt="DevVault"
                    className="hidden w-30 h-auto object-contain dark:block"
                />
            </div>
        
            <div className="text-5xl font-extrabold tabular-nums text-vault-text tracking-tight mb-4">
                {percent}%
            </div>
        
            <div className="w-56 h-1.5 rounded-full bg-vault-border overflow-hidden mb-4">
                <div
                className="h-full bg-vault-accent rounded-full"
                style={{ width: `${percent}%`, transition: 'width 80ms linear' }}
                />
            </div>
        
            <p className="text-sm text-vault-muted">{label}</p>
        </div>
    );
}