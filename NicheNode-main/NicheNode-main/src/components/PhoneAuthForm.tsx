import React, { useState } from 'react';
import { Phone, Shield } from 'lucide-react';
import { useToast } from './Toast';

interface PhoneAuthFormProps {
  mode: 'signin' | 'signup';
  onSuccess?: () => void;
  rememberMe: boolean;
  onRememberMeChange: (value: boolean) => void;
}

export function PhoneAuthForm({ mode, onSuccess, rememberMe, onRememberMeChange }: PhoneAuthFormProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate sending SMS verification code
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // In a real implementation, this would call your SMS service
      showToast('📱 Verification code sent to your phone!', 'success');
      setStep('verify');
    } catch (error) {
      showToast('Failed to send verification code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Simulate code verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (verificationCode === '123456') {
        showToast('✅ Phone number verified successfully!', 'success');
        onSuccess?.();
      } else {
        throw new Error('Invalid verification code');
      }
    } catch (error) {
      showToast('Invalid verification code. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatPhoneNumber = (value: string) => {
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 7) {
      return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3)}`;
    }
    return `(${phoneNumber.slice(0, 3)}) ${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhoneNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedPhoneNumber);
  };

  if (step === 'verify') {
    return (
      <form onSubmit={handleVerifyCode} className="space-y-4">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            Verify Your Phone Number
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">
            We sent a 6-digit code to {phoneNumber}
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-4 py-3 text-center text-2xl font-mono rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="000000"
            maxLength={6}
            required
          />
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 text-center">
            Demo code: 123456
          </p>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStep('phone')}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            ← Change phone number
          </button>
          <button
            type="button"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          >
            Resend code
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || verificationCode.length !== 6}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
        >
          {loading ? 'Verifying...' : 'Verify & Continue'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSendCode} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
          Phone Number
        </label>
        <div className="relative">
          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="tel"
            value={phoneNumber}
            onChange={handlePhoneChange}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
            placeholder="(555) 123-4567"
            required
          />
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          We'll send you a verification code via SMS
        </p>
      </div>

      <div className="flex items-center">
        <input
          type="checkbox"
          id="phone-remember"
          checked={rememberMe}
          onChange={(e) => onRememberMeChange(e.target.checked)}
          className="rounded border-slate-300 dark:border-slate-600 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="phone-remember" className="ml-2 text-sm text-slate-600 dark:text-slate-400">
          Remember this device
        </label>
      </div>

      <button
        type="submit"
        disabled={loading || phoneNumber.length < 14}
        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
      >
        {loading ? 'Sending Code...' : 'Send Verification Code'}
      </button>

      <div className="text-center">
        <p className="text-xs text-slate-500 dark:text-slate-400">
          By continuing, you agree to receive SMS messages. Message and data rates may apply.
        </p>
      </div>
    </form>
  );
}