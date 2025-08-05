'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Header from '../components/Header';
import styles from '../styles/LoginPage.module.css';
import { initSplineViewer, optimizeSplineLoading } from '../utils/spline';

export default function LoginPage() {
    const searchParams = useSearchParams();
    const [isLoginForm, setIsLoginForm] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [showSignupPassword, setShowSignupPassword] = useState(false);
    const splineViewerRef = useRef(null);

    // 根據 URL 參數決定顯示登入還是註冊表單
    useEffect(() => {
        const signupParam = searchParams.get('signup');
        if (signupParam === '1') {
            setIsLoginForm(false);
        } else {
            setIsLoginForm(true);
        }
    }, [searchParams]);

    // 初始化 Spline viewer
    useEffect(() => {
        initSplineViewer();
    }, []);

    // 優化 Spline 模型載入
    useEffect(() => {
        if (splineViewerRef.current) {
            optimizeSplineLoading(splineViewerRef.current);
        }
    }, []);

    const showLoginForm = () => {
        setIsLoginForm(true);
    };

    const showSignupForm = () => {
        setIsLoginForm(false);
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleSignupPasswordVisibility = () => {
        setShowSignupPassword(!showSignupPassword);
    };

    return (
        <>
            <Header showAuthNav={true} />
            
            <main className={styles.authMain}>
                <div className={styles.authContainer}>
                    <div className={`${styles.formSection} ${isLoginForm ? '' : styles.hidden}`} id="loginSection">
                        <h1 className={styles.authTitle}>LOGIN</h1>

                        <form className={styles.authForm}>
                            <div className={styles.inputGroup}>
                                <div className={styles.inputHeader}>
                                    <div className={styles.inputIcon}>
                                        <Image src="/img/Vector-6.png" alt="Email icon" className={styles.icon} width={24} height={24} />
                                    </div>
                                    <label className={styles.inputLabel}>EMAIL</label>
                                </div>
                                <input type="email" className={styles.inputField} required />
                                <div className={styles.inputUnderline}></div>
                            </div>

                            <div className={styles.inputGroup}>
                                <div className={styles.inputHeader}>
                                    <div className={styles.inputIcon}>
                                        <Image src="/img/Vector-7.png" alt="Password icon" className={styles.icon} width={24} height={24} />
                                    </div>
                                    <label className={styles.inputLabel}>PASSWORD</label>
                                </div>
                                <div className={styles.passwordInputContainer}>
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className={styles.inputField} 
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        className={styles.passwordToggle}
                                        onClick={togglePasswordVisibility}
                                    >
                                        <Image 
                                            src="/img/Vector-39.png" 
                                            alt="Show password" 
                                            className={`${styles.icon} ${showPassword ? styles.hidden : ''}`}
                                            width={20} 
                                            height={20} 
                                        />
                                        <Image 
                                            src="/img/Vector-38.png" 
                                            alt="Hide password" 
                                            className={`${styles.icon} ${showPassword ? '' : styles.hidden}`}
                                            width={20} 
                                            height={20} 
                                        />
                                    </button>
                                </div>
                                <div className={styles.inputUnderline}></div>
                            </div>

                            <div className={styles.forgotPassword}>
                                <a href="#" className={styles.linkText}>忘記密碼？</a>
                            </div>

                            <button type="submit" className={styles.authButton}>LOGIN</button>
                        </form>

                        <div className={styles.switchLink}>
                            <a href="#" className={styles.linkText} onClick={showSignupForm}>還沒有帳號？註冊</a>
                        </div>
                    </div>

                    <div className={`${styles.formSection} ${!isLoginForm ? '' : styles.hidden}`} id="signupSection">
                        <h1 className={styles.authTitle}>SIGN UP</h1>

                        <form className={styles.authForm}>
                            <div className={styles.inputGroup}>
                                <div className={styles.inputHeader}>
                                    <div className={styles.inputIcon}>
                                        <Image src="/img/Vector-36.png" alt="Username icon" className={styles.icon} width={24} height={24} />
                                    </div>
                                    <label className={styles.inputLabel}>USERNAME</label>
                                </div>
                                <input type="text" className={styles.inputField} required />
                                <div className={styles.inputUnderline}></div>
                            </div>

                            <div className={styles.inputGroup}>
                                <div className={styles.inputHeader}>
                                    <div className={styles.inputIcon}>
                                        <Image src="/img/Vector-6.png" alt="Email icon" className={styles.icon} width={24} height={24} />
                                    </div>
                                    <label className={styles.inputLabel}>EMAIL</label>
                                </div>
                                <input type="email" className={styles.inputField} required />
                                <div className={styles.inputUnderline}></div>
                            </div>

                            <div className={styles.inputGroup}>
                                <div className={styles.inputHeader}>
                                    <div className={styles.inputIcon}>
                                        <Image src="/img/Vector-7.png" alt="Password icon" className={styles.icon} width={24} height={24} />
                                    </div>
                                    <label className={styles.inputLabel}>PASSWORD</label>
                                </div>
                                <div className={styles.passwordInputContainer}>
                                    <input 
                                        type={showSignupPassword ? "text" : "password"} 
                                        className={styles.inputField} 
                                        required 
                                    />
                                    <button 
                                        type="button" 
                                        className={styles.passwordToggle}
                                        onClick={toggleSignupPasswordVisibility}
                                    >
                                        <Image 
                                            src="/img/Vector-39.png" 
                                            alt="Show password" 
                                            className={`${styles.icon} ${showSignupPassword ? styles.hidden : ''}`}
                                            width={20} 
                                            height={20} 
                                        />
                                        <Image 
                                            src="/img/Vector-38.png" 
                                            alt="Hide password" 
                                            className={`${styles.icon} ${showSignupPassword ? '' : styles.hidden}`}
                                            width={20} 
                                            height={20} 
                                        />
                                    </button>
                                </div>
                                <div className={styles.inputUnderline}></div>
                            </div>

                            <button type="submit" className={styles.authButton}>SIGN UP</button>
                        </form>

                        <div className={styles.switchLink}>
                            <a href="#" className={styles.linkText} onClick={showLoginForm}>已經有帳號了？登入</a>
                        </div>
                    </div>
                </div>
                
                <div className={styles.splineContainer}>
                    <spline-viewer 
                        ref={splineViewerRef}
                        loading-anim-type="none" 
                        loading-anim-duration="0"
                        url="https://prod.spline.design/WZMDq8J83oGNSegR/scene.splinecode"
                        style={{ width: '100%', height: '100%', minWidth: '400px', minHeight: '600px' }}>
                    </spline-viewer>
                </div>
            </main>
        </>
    );
} 