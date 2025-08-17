'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

function PaymentSuccessContent() {
  const [paymentData, setPaymentData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    try {
      // 從 URL 參數中取得 ECPay 回傳的資料
      const params = {};
      
      // 安全地處理 searchParams
      if (searchParams) {
        for (const [key, value] of searchParams.entries()) {
          // 確保 key 和 value 都是有效的
          if (key && value !== undefined && value !== null) {
            params[key] = value;
          }
        }
      }

      console.log('ECPay 回傳參數:', params);
      setPaymentData(params);
      setIsLoading(false);

      // 如果有付款成功相關的參數，可以在這裡處理
      if (params.RtnCode === '1') {
        // 付款成功，可以更新用戶狀態或導向特定頁面
        console.log('付款成功！');
      }
    } catch (err) {
      console.error('處理付款參數時發生錯誤:', err);
      setError(err.message);
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleReturnHome = () => {
    try {
      router.push('/');
    } catch (err) {
      console.error('導航錯誤:', err);
      window.location.href = '/';
    }
  };

  const handleReturnDashboard = () => {
    try {
      router.push('/user');
    } catch (err) {
      console.error('導航錯誤:', err);
      window.location.href = '/user';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
            <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h2 className="mt-4 text-xl font-semibold text-gray-900">處理錯誤</h2>
          <p className="mt-2 text-sm text-gray-600">{error}</p>
          <button 
            onClick={handleReturnHome}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            返回首頁
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">處理付款結果中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {paymentData?.RtnCode === '1' ? (
            // 付款成功
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                付款成功！
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                感謝您的購買，您的訂單已經處理完成。
              </p>
              {paymentData?.MerchantTradeNo && (
                <p className="mt-2 text-sm text-gray-500">
                  訂單編號：{paymentData.MerchantTradeNo}
                </p>
              )}
            </div>
          ) : (
            // 付款失敗或其他狀況
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg
                  className="h-6 w-6 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </div>
              <h2 className="mt-4 text-xl font-semibold text-gray-900">
                付款處理中或失敗
              </h2>
              <p className="mt-2 text-sm text-gray-600">
                {paymentData?.RtnMsg || '付款可能尚未完成或發生錯誤，請聯絡客服。'}
              </p>
            </div>
          )}

          <div className="mt-6 space-y-3">
            <button
              onClick={handleReturnDashboard}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              前往會員中心
            </button>
            <button
              onClick={handleReturnHome}
              className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              返回首頁
            </button>
          </div>

          {/* 除錯資訊（開發時使用） */}
          {process.env.NODE_ENV === 'development' && paymentData && (
            <details className="mt-6">
              <summary className="text-sm text-gray-500 cursor-pointer">
                除錯資訊（開發模式）
              </summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-auto">
                {JSON.stringify(paymentData, null, 2)}
              </pre>
            </details>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">載入中...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
