
import { useState, useRef, useEffect, useCallback } from 'react';

type TimerMode = 'standard' | 'work' | 'break';

interface TimerState {
    mode: TimerMode;
    duration: number;
}

interface UseTimerProps {
    onTimerEnd: () => void;
}

const POMODORO_DURATIONS = {
    work: 25 * 60,
    break: 5 * 60,
};

export const useTimer = ({ onTimerEnd }: UseTimerProps) => {
    const [time, setTime] = useState(0);
    const [isRunning, setIsRunning] = useState(false);
    const [timerState, setTimerState] = useState<TimerState>({ mode: 'standard', duration: 0 });
    
    const intervalRef = useRef<number | null>(null);
    const timeRef = useRef(0);

    const cleanup = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startTimer = useCallback((mode: TimerMode) => {
        setIsRunning(true);
        let duration = 0;
        let startTime = timeRef.current;

        if (mode === 'work' || mode === 'break') {
            duration = POMODORO_DURATIONS[mode];
            startTime = duration; // Start countdown from full duration
        } else if (mode === 'standard' && timeRef.current === 0) {
            startTime = 0; // Start stopwatch from 0
        }
        
        setTimerState({ mode, duration });
        setTime(startTime);
        timeRef.current = startTime;

        cleanup();
        intervalRef.current = window.setInterval(() => {
            if (mode === 'work' || mode === 'break') {
                timeRef.current -= 1;
                setTime(timeRef.current);
                if (timeRef.current <= 0) {
                    cleanup();
                    setIsRunning(false);
                    onTimerEnd();
                }
            } else {
                timeRef.current += 1;
                setTime(timeRef.current);
            }
        }, 1000);
    }, [onTimerEnd]);

    const pauseTimer = useCallback(() => {
        setIsRunning(false);
        cleanup();
    }, []);

    const stopTimer = useCallback(() => {
        const elapsed = timeRef.current;
        setIsRunning(false);
        cleanup();
        setTime(0);
        timeRef.current = 0;
        setTimerState({ mode: 'standard', duration: 0 });
        return elapsed;
    }, []);

    useEffect(() => {
        return cleanup;
    }, []);

    return { time, startTimer, pauseTimer, stopTimer, isRunning, timerState };
};
