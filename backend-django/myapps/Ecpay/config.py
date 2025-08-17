# config.py

class ECPayConfig:
    """綠界金流設定"""
    
    # 測試環境設定
    TEST_MODE = True
    
    # 測試商店資訊（綠界提供的測試參數）
    MERCHANT_ID = '3002607'
    HASH_KEY = 'pwFHCqoQZGmho4w6'
    HASH_IV = 'EkRm7iFT261dpevs'
    
    # API 網址（測試/正式）
    if TEST_MODE:
        ACTION_URL = 'https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5'
        CLIENT_BACK_URL = 'http://localhost:3000/payment/success'  # 前端返回頁面，指向特定路由
    else:
        ACTION_URL = 'https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5'
        CLIENT_BACK_URL = 'https://your-production-frontend.com/payment/success'

    # 回傳網址（ECPay server -> your server）
    RETURN_URL = 'http://localhost:8000/ECpay-return/'

config = ECPayConfig()

