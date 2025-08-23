from rest_framework import serializers
from .models import UserSubscription , Order , PaymentPlan ,EcpayLogs
from myapps.Authorization.serializers import UserSimplifiedSerializer

class UserSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        User = UserSimplifiedSerializer
        model = UserSubscription
        fields = 'user , order , plan , end_date , start_date'

class OrderSerializer(serializers.ModelSerializer):
    class Meta:
        User = UserSimplifiedSerializer
        model = Order
        fields = 'user , amount  , status , is_paid , updated_at , payment_method ' 
        extra_kwargs = {
            'updated_at': {'required': False, 'allow_null': True},
            'status': {
                'required': False, 'allow_null': True,
                'default': 'pending'
            }
        }

class EcpayLogsSerializer(serializers.ModelSerializer):
    class Meta:
        model = EcpayLogs
        fields = '__all__'

# API 文件------------------
class EcpayReturnSerializer(serializers.Serializer):
    MerchantID = serializers.CharField(max_length=20, help_text="商店代號")
    MerchantTradeNo = serializers.CharField(max_length=20, help_text="商店交易編號")
    StoreID = serializers.CharField(max_length=20, help_text="商店代號", required=False, allow_blank=True)
    RtnCode = serializers.IntegerField(help_text="交易結果回傳碼")
    RtnMsg = serializers.CharField(max_length=200, help_text="交易結果回傳訊息")
    TradeNo = serializers.CharField(max_length=20, help_text="綠界的交易編號")
    TradeAmt = serializers.IntegerField(help_text="交易金額")
    PaymentDate = serializers.CharField(max_length=20, help_text="付款完成時間", required=False, allow_blank=True)
    PaymentType = serializers.CharField(max_length=20, help_text="付款方式", required=False, allow_blank=True)
    TradeDate = serializers.CharField(max_length=20, help_text="交易時間")
    SimulatePaid = serializers.IntegerField(help_text="模擬付款", required=False)

class EcpayURLRedirectSerializer(serializers.Serializer):
    MerchantID = serializers.CharField(max_length=20, help_text="商店代號")
    MerchantTradeNo = serializers.CharField(max_length=20, help_text="商店交易編號")
    StoreID = serializers.CharField(max_length=20, help_text="商店代號", required=False, allow_blank=True)
    RtnCode = serializers.IntegerField(help_text="交易結果回傳碼")
    RtnMsg = serializers.CharField(max_length=200, help_text="交易結果回傳訊息")
    TradeNo = serializers.CharField(max_length=20, help_text="綠界的交易編號")
    TradeAmt = serializers.IntegerField(help_text="交易金額")
    PaymentDate = serializers.CharField(max_length=20, help_text="付款完成時間", required=False, allow_blank=True)
    PaymentType = serializers.CharField(max_length=20, help_text="付款方式", required=False, allow_blank=True)
    TradeDate = serializers.CharField(max_length=20, help_text="交易時間")

class PaymentStatusSerializer(serializers.Serializer):
    RtnCode = serializers.IntegerField(help_text="交易結果回傳碼")
    RtnMsg = serializers.CharField(max_length=200, help_text="交易結果回傳訊息")
    TradeNo = serializers.CharField(max_length=20, help_text="綠界的交易編號")
    TradeAmt = serializers.IntegerField(help_text="交易金額")
    PaymentDate = serializers.CharField(max_length=20, help_text="付款完成時間", required=False, allow_blank=True)

class EcpaySerializer(serializers.Serializer):
    MerchantID = serializers.CharField(max_length=20, help_text="商店代號")
    MerchantTradeNo = serializers.CharField(max_length=20, help_text="商店交易編號")
    StoreID = serializers.CharField(max_length=20, help_text="商店代號", required=False, allow_blank=True)
    RtnCode = serializers.IntegerField(help_text="交易結果回傳碼")
    RtnMsg = serializers.CharField(max_length=200, help_text="交易結果回傳訊息")
    TradeNo = serializers.CharField(max_length=20, help_text="綠界的交易編號")
    TradeAmt = serializers.IntegerField(help_text="交易金額")
    PaymentDate = serializers.CharField(max_length=20, help_text="付款完成時間", required=False, allow_blank=True)
    PaymentType = serializers.CharField(max_length=20, help_text="付款方式", required=False, allow_blank=True)
    TradeDate = serializers.CharField(max_length=20, help_text="交易時間")