import React from 'react'
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
function Timer({timeLeft,totalTime}) {
    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;
    const percentage = (timeLeft / totalTime) * 100;

    return (
        <div className="w-32 h-32">
            <CircularProgressbar value={percentage} text={`${timeLeft}%`}
            styles ={buildStyles({
                textSize: '28px',
                pathColor: '#10b981',
                textColor: '#ef4444',
                trailColor: '#e5e7eb',
            })}
            />
        </div>
    );
}

export default Timer;