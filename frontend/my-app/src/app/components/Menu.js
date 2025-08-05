'use client';

import Link from 'next/link';
import Image from 'next/image';

export default function Menu({ 
    isOpen = false, 
    onClose = null,
    onLogout = null 
}) {
    return (
        <>
            {/* 選單背景 */}
            <div 
                className={`menu-backdrop ${isOpen ? 'active' : ''}`} 
                onClick={onClose}
            ></div>

            {/* 選單下拉 */}
            <div className={`menu-dropdown ${isOpen ? 'active' : ''}`}>
                <div className="menu-header"></div>

                <Link href="/" className="menu-item">
                    <Image src="/img/Vector-16.png" alt="" className="menu-item-icon" width={24} height={24} />
                    <span>首頁</span>
                </Link>

                <Link href="/note" className="menu-item">
                    <Image src="/img/Vector-15.png" alt="" className="menu-item-icon" width={24} height={24} />
                    <span>筆記</span>
                </Link>

                <Link href="/user" className="menu-item">
                    <Image src="/img/Vector-33.png" alt="" className="menu-item-icon" width={24} height={24} />
                    <span>使用者</span>
                </Link>

                <button 
                    className="menu-item" 
                    onClick={onLogout}
                    style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                >
                    <Image src="/img/Vector-30.png" alt="" className="menu-item-icon" width={24} height={24} />
                    <span>登出</span>
                </button>
            </div>
        </>
    );
} 