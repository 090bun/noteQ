"use client";

import { useEffect, useState, useRef } from "react";
import styles from "../styles/DecryptedText.module.css";

const DecryptedText = ({ 
  text, 
  onComplete, 
  speed = 100, 
  scrambleSpeed = 200,
  className = "" 
}) => {
  const [displayText, setDisplayText] = useState("");
  const [isComplete, setIsComplete] = useState(false);
  const [scrambleText, setScrambleText] = useState("");
  const intervalRef = useRef(null);
  const scrambleIntervalRef = useRef(null);

  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+-=[]{}|;:,.<>?";

  const generateFullScrambleText = () => {
    let result = "";
    for (let i = 0; i < text.length; i++) {
      result += characters[Math.floor(Math.random() * characters.length)];
    }
    return result;
  };

  useEffect(() => {
    if (!text) return;

    let currentLength = 0;
    const targetText = text;

    // 開始解密動畫
    intervalRef.current = setInterval(() => {
      if (currentLength <= targetText.length) {
        setDisplayText(targetText.substring(0, currentLength));
        currentLength++;
      } else {
        clearInterval(intervalRef.current);
        setIsComplete(true);
        onComplete?.();
      }
    }, speed);

    // 清理函數
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    };
  }, [text, speed, onComplete]);

  // 亂碼文字一直跑動效果
  useEffect(() => {
    if (isComplete) return;

    // 立即生成一次亂碼
    setScrambleText(generateFullScrambleText());
    
    // 持續更新亂碼
    scrambleIntervalRef.current = setInterval(() => {
      setScrambleText(generateFullScrambleText());
    }, scrambleSpeed);

    return () => {
      if (scrambleIntervalRef.current) {
        clearInterval(scrambleIntervalRef.current);
      }
    };
  }, [isComplete, text, scrambleSpeed]);

  return (
    <div className={`${styles.decryptedText} ${className}`}>
      {/* 故障背景 */}
      <div className={styles.glitchBackground}>
        {Array.from({ length: 15 }, (_, i) => (
          <div key={i} className={styles.glitchLine}>
            {Array.from({ length: 30 }, (_, j) => (
              <span key={j} className={styles.glitchChar}>
                {characters[Math.floor(Math.random() * characters.length)]}
              </span>
            ))}
          </div>
        ))}
      </div>
      
      {/* 解密文字 */}
      <div className={styles.textContainer}>
        <span className={styles.mainText}>{displayText}</span>
        <span className={styles.scrambleText}>{scrambleText}</span>
      </div>
      {!isComplete}
    </div>
  );
};

export default DecryptedText; 